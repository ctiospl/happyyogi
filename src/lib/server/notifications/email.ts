interface EmailConfig {
	token: string;
	fromEmail: string;
	fromName?: string;
}

interface SendEmailOptions {
	to: string;
	subject: string;
	htmlBody: string;
	textBody?: string;
}

interface EmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

class ZeptoMailClient {
	private baseUrl = 'https://api.zeptomail.com/v1.1/email';
	private token: string;
	private fromEmail: string;
	private fromName: string;
	private devMode: boolean;

	constructor(config?: EmailConfig) {
		this.token = config?.token || process.env.ZEPTOMAIL_TOKEN || '';
		this.fromEmail = config?.fromEmail || process.env.ZEPTOMAIL_FROM_EMAIL || '';
		this.fromName = config?.fromName || process.env.ZEPTOMAIL_FROM_NAME || 'Happy Yogi';
		this.devMode = !this.token || !this.fromEmail || process.env.NODE_ENV === 'development';
	}

	async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
		if (this.devMode) {
			console.log(`[DEV] Email would be sent to: ${options.to}`);
			console.log(`[DEV] Subject: ${options.subject}`);
			console.log(`[DEV] Body preview: ${(options.textBody || options.htmlBody).slice(0, 200)}...`);
			return { success: true, messageId: 'dev-message-id' };
		}

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Zoho-enczapikey ${this.token}`
				},
				body: JSON.stringify({
					from: { address: this.fromEmail, name: this.fromName },
					to: [{ email_address: { address: options.to } }],
					subject: options.subject,
					htmlbody: options.htmlBody,
					textbody: options.textBody
				})
			});

			const data = await response.json();
			if (response.ok) {
				return { success: true, messageId: data.request_id };
			}
			return { success: false, error: data.message || 'Email send failed' };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const emailClient = new ZeptoMailClient();

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
	return emailClient.sendEmail(options);
}
