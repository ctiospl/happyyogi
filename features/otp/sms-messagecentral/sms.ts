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

export class MessageCentralClient {
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
		this.email = config?.email || process.env.MESSAGE_CENTRAL_EMAIL || 'noreply@example.com';
		this.devMode = !this.customerId || !this.apiKey || process.env.NODE_ENV === 'development';
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

// Singleton instance
export const smsClient = new MessageCentralClient();
