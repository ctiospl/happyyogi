import { WHATSAPP_CONFIG } from './config.js';

export async function getMediaUrl(mediaId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_CONFIG.token}` }
    });
    const data = await response.json();
    return data.url || null;
  } catch {
    return null;
  }
}

export async function downloadMedia(mediaUrl: string): Promise<Buffer | null> {
  try {
    const response = await fetch(mediaUrl, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_CONFIG.token}` }
    });
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}
