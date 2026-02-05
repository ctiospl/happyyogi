export interface WhatsAppConfig {
  phoneNumberId: string;
  token: string;
  verifyToken: string;
  appSecret?: string;
}

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  token: process.env.WHATSAPP_TOKEN || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  appSecret: process.env.WHATSAPP_APP_SECRET
};

export function graphApiUrl(phoneNumberId: string = WHATSAPP_CONFIG.phoneNumberId) {
  return `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
}

export function validateConfig(): boolean {
  return !!(WHATSAPP_CONFIG.phoneNumberId && WHATSAPP_CONFIG.token && WHATSAPP_CONFIG.verifyToken);
}
