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

interface SendOtpOptions {
	to: string;
	code: string;
	appName?: string;
}

interface EmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

export class ZeptoMailClient {
	private baseUrl = 'https://api.zeptomail.com/v1.1/email';
	private token: string;
	private fromEmail: string;
	private fromName: string;
	private devMode: boolean;

	constructor(config?: EmailConfig) {
		this.token = config?.token || process.env.ZEPTOMAIL_TOKEN || '';
		this.fromEmail = config?.fromEmail || process.env.ZEPTOMAIL_FROM_EMAIL || '';
		this.fromName = config?.fromName || process.env.ZEPTOMAIL_FROM_NAME || 'App';
		this.devMode = !this.token || !this.fromEmail || process.env.NODE_ENV === 'development';
	}

	async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
		if (this.devMode) {
			console.log(`[DEV] Email would be sent to: ${options.to}`);
			console.log(`[DEV] Subject: ${options.subject}`);
			console.log(`[DEV] Body: ${options.textBody || options.htmlBody}`);
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

	async sendOtpEmail(options: SendOtpOptions): Promise<EmailResult> {
		const appName = options.appName || 'App';
		return this.sendEmail({
			to: options.to,
			subject: `Your ${appName} verification code`,
			htmlBody: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2>Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f5f5f5; text-align: center; border-radius: 8px;">
            ${options.code}
          </div>
          <p style="color: #666; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
			textBody: `Your ${appName} verification code is: ${options.code}. This code expires in 10 minutes.`
		});
	}
}

// Singleton instance
export const emailClient = new ZeptoMailClient();
