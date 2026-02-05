import { db } from '$lib/server/db';
import { createHash, randomBytes } from 'crypto';
import type { OtpPurpose } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/notifications/email';

interface MessageCentralConfig {
	customerId: string;
	apiKey: string;
	country?: string;
	email?: string;
}

interface SendOtpResult {
	success: boolean;
	verificationId?: string;
	error?: string;
}

interface VerifyOtpResult {
	success: boolean;
	error?: string;
}

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

class MessageCentralClient {
	private baseUrl = 'https://cpaas.messagecentral.com';
	private customerId: string;
	private apiKey: string;
	private country: string;
	private email: string;
	private devMode: boolean;

	constructor(config?: MessageCentralConfig) {
		this.customerId = config?.customerId || process.env.MESSAGE_CENTRAL_CUSTOMER_ID || '';
		this.apiKey = config?.apiKey || process.env.MESSAGE_CENTRAL_API_KEY || '';
		this.country = config?.country || process.env.MESSAGE_CENTRAL_COUNTRY || '91';
		this.email = config?.email || process.env.MESSAGE_CENTRAL_EMAIL || 'noreply@happyyogi.in';
		// Only use dev mode if credentials are missing (ignore NODE_ENV)
		this.devMode = !this.customerId || !this.apiKey;
	}

	async sendOtp(phoneNumber: string, countryCode: string = '91'): Promise<SendOtpResult> {
		if (this.devMode) {
			console.log(`[DEV] SMS OTP would be sent to +${countryCode}${phoneNumber}`);
			console.log(`[DEV] Use code: 123456`);
			return { success: true, verificationId: 'dev-verification-id' };
		}

		try {
			const authToken = await this.getAuthToken();
			const response = await fetch(
				`${this.baseUrl}/verification/v3/send?countryCode=${countryCode}&customerId=${this.customerId}&flowType=SMS&mobileNumber=${phoneNumber}`,
				{
					method: 'POST',
					headers: {
						authToken: authToken
					}
				}
			);

			const data = await response.json();
			if (data.responseCode === 200) {
				return { success: true, verificationId: data.data.verificationId };
			}
			return { success: false, error: data.message };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async verifyOtp(verificationId: string, code: string): Promise<VerifyOtpResult> {
		if (this.devMode) {
			const isValid = code === '123456';
			console.log(`[DEV] OTP verification: ${isValid ? 'success' : 'failed'}`);
			return { success: isValid, error: isValid ? undefined : 'Invalid code' };
		}

		try {
			const authToken = await this.getAuthToken();
			const response = await fetch(
				`${this.baseUrl}/verification/v3/validateOtp?customerId=${this.customerId}&verificationId=${verificationId}&code=${code}`,
				{
					method: 'GET',
					headers: {
						authToken: authToken
					}
				}
			);

			const data = await response.json();
			if (data.responseCode === 200 && data.data.verificationStatus === 'VERIFICATION_COMPLETED') {
				return { success: true };
			}
			return { success: false, error: data.message || 'Verification failed' };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	private async getAuthToken(): Promise<string> {
		const response = await fetch(
			`${this.baseUrl}/auth/v1/authentication/token?customerId=${this.customerId}&key=${encodeURIComponent(this.apiKey)}&scope=NEW&country=${this.country}&email=${encodeURIComponent(this.email)}`,
			{ method: 'GET' }
		);
		if (!response.ok) {
			throw new Error(`Auth failed: ${response.status}`);
		}
		const data = await response.json();
		if (!data.token) {
			throw new Error('No token in response');
		}
		return data.token;
	}
}

export const smsClient = new MessageCentralClient();

function hashOtp(otp: string): string {
	return createHash('sha256').update(otp).digest('hex');
}

function generateOtp(): string {
	// Generate 6-digit OTP
	const digits = '0123456789';
	let otp = '';
	const bytes = randomBytes(6);
	for (let i = 0; i < 6; i++) {
		otp += digits[bytes[i] % 10];
	}
	return otp;
}

export async function sendOtp(phone: string, purpose: OtpPurpose = 'login') {
	// Normalize phone (remove spaces, ensure + prefix for international)
	const normalizedPhone = phone.replace(/\s/g, '').replace(/^0/, '');

	// Check for existing unexpired OTP
	const existing = await db
		.selectFrom('otp_verifications')
		.where('phone', '=', normalizedPhone)
		.where('purpose', '=', purpose)
		.where('expires_at', '>', new Date())
		.where('verified_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (existing && existing.attempts >= MAX_ATTEMPTS) {
		return { success: false, error: 'Too many attempts. Please wait and try again.' };
	}

	// Generate OTP (use fixed OTP only if SMS client is in dev mode)
	const otp = smsClient['devMode'] ? '123456' : generateOtp();
	const otpHash = hashOtp(otp);

	// Delete old OTPs for this phone/purpose
	await db
		.deleteFrom('otp_verifications')
		.where('phone', '=', normalizedPhone)
		.where('purpose', '=', purpose)
		.execute();

	// Create new OTP record
	const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

	await db
		.insertInto('otp_verifications')
		.values({
			phone: normalizedPhone,
			otp_hash: otpHash,
			purpose,
			expires_at: expiresAt
		})
		.execute();

	// Send OTP via Message Central (or log in dev mode)
	if (smsClient['devMode']) {
		console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);
		return { success: true };
	}

	// Extract country code (assume India if not specified)
	const countryCode = normalizedPhone.startsWith('+') ? normalizedPhone.slice(1, 3) : '91';
	const phoneWithoutCountry = normalizedPhone.replace(/^\+?91/, '');

	const result = await smsClient.sendOtp(phoneWithoutCountry, countryCode);
	return result;
}

export async function verifyOtp(phone: string, code: string, purpose: OtpPurpose = 'login') {
	const normalizedPhone = phone.replace(/\s/g, '').replace(/^0/, '');

	// Find the OTP record
	const otpRecord = await db
		.selectFrom('otp_verifications')
		.where('phone', '=', normalizedPhone)
		.where('purpose', '=', purpose)
		.where('expires_at', '>', new Date())
		.where('verified_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (!otpRecord) {
		return { success: false, error: 'OTP expired or not found. Please request a new one.' };
	}

	if (otpRecord.attempts >= MAX_ATTEMPTS) {
		return { success: false, error: 'Too many attempts. Please request a new OTP.' };
	}

	// Increment attempts
	await db
		.updateTable('otp_verifications')
		.set({ attempts: otpRecord.attempts + 1 })
		.where('id', '=', otpRecord.id)
		.execute();

	// Verify OTP hash
	const codeHash = hashOtp(code);
	if (codeHash !== otpRecord.otp_hash) {
		return { success: false, error: 'Invalid OTP code.' };
	}

	// Mark as verified
	await db
		.updateTable('otp_verifications')
		.set({ verified_at: new Date() })
		.where('id', '=', otpRecord.id)
		.execute();

	return { success: true, phone: normalizedPhone };
}

export async function sendEmailOtp(email: string, purpose: OtpPurpose = 'login') {
	const normalizedEmail = email.toLowerCase().trim();

	// Check for existing unexpired OTP
	const existing = await db
		.selectFrom('otp_verifications')
		.where('phone', '=', normalizedEmail) // reusing phone column for email
		.where('purpose', '=', purpose)
		.where('expires_at', '>', new Date())
		.where('verified_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (existing && existing.attempts >= MAX_ATTEMPTS) {
		return { success: false, error: 'Too many attempts. Please wait and try again.' };
	}

	// Generate OTP (use fixed OTP only if no email service configured)
	const emailDevMode = !process.env.ZEPTOMAIL_TOKEN;
	const otp = emailDevMode ? '123456' : generateOtp();
	const otpHash = hashOtp(otp);

	// Delete old OTPs for this email/purpose
	await db
		.deleteFrom('otp_verifications')
		.where('phone', '=', normalizedEmail)
		.where('purpose', '=', purpose)
		.execute();

	// Create new OTP record
	const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

	await db
		.insertInto('otp_verifications')
		.values({
			phone: normalizedEmail, // reusing phone column for email
			otp_hash: otpHash,
			purpose,
			expires_at: expiresAt
		})
		.execute();

	// Send OTP via email (or log in dev mode)
	if (emailDevMode) {
		console.log(`[DEV] Email OTP for ${normalizedEmail}: ${otp}`);
		return { success: true };
	}

	const result = await sendEmail({
		to: normalizedEmail,
		subject: 'Your Happy Yogi verification code',
		htmlBody: `
			<div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
				<h2>Verification Code</h2>
				<p>Your verification code is:</p>
				<div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f5f5f5; text-align: center; border-radius: 8px;">
					${otp}
				</div>
				<p style="color: #666; margin-top: 20px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
			</div>
		`,
		textBody: `Your Happy Yogi verification code is: ${otp}. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`
	});

	return result;
}

export async function verifyEmailOtp(email: string, code: string, purpose: OtpPurpose = 'login') {
	const normalizedEmail = email.toLowerCase().trim();

	// Find the OTP record (reusing phone column for email)
	const otpRecord = await db
		.selectFrom('otp_verifications')
		.where('phone', '=', normalizedEmail)
		.where('purpose', '=', purpose)
		.where('expires_at', '>', new Date())
		.where('verified_at', 'is', null)
		.selectAll()
		.executeTakeFirst();

	if (!otpRecord) {
		return { success: false, error: 'OTP expired or not found. Please request a new one.' };
	}

	if (otpRecord.attempts >= MAX_ATTEMPTS) {
		return { success: false, error: 'Too many attempts. Please request a new OTP.' };
	}

	// Increment attempts
	await db
		.updateTable('otp_verifications')
		.set({ attempts: otpRecord.attempts + 1 })
		.where('id', '=', otpRecord.id)
		.execute();

	// Verify OTP hash
	const codeHash = hashOtp(code);
	if (codeHash !== otpRecord.otp_hash) {
		return { success: false, error: 'Invalid OTP code.' };
	}

	// Mark as verified
	await db
		.updateTable('otp_verifications')
		.set({ verified_at: new Date() })
		.where('id', '=', otpRecord.id)
		.execute();

	return { success: true, email: normalizedEmail };
}
