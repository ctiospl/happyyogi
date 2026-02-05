import { WHATSAPP_CONFIG, graphApiUrl } from './config.js';

interface SendResult { success: boolean; messageId?: string; error?: string }

export async function sendTextMessage(to: string, text: string): Promise<SendResult> {
  try {
    const response = await fetch(graphApiUrl(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text }
      })
    });
    const data = await response.json();
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }
    return { success: false, error: data.error?.message || 'Send failed' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function sendButtonMessage(to: string, bodyText: string, buttons: { id: string; title: string }[]): Promise<SendResult> {
  try {
    const response = await fetch(graphApiUrl(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: { buttons: buttons.slice(0, 3).map(b => ({ type: 'reply', reply: b })) }
        }
      })
    });
    const data = await response.json();
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }
    return { success: false, error: data.error?.message || 'Send failed' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
