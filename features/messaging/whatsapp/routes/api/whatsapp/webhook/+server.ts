import type { RequestHandler } from '@sveltejs/kit';
import crypto from 'crypto';
import { WHATSAPP_CONFIG } from '$lib/server/whatsapp/config.js';
import type { WebhookPayload, IncomingMessage } from '$lib/server/whatsapp/types.js';
import { isTextMessage } from '$lib/server/whatsapp/types.js';
import { sendTextMessage } from '$lib/server/whatsapp/reply.js';
import { checkRateLimit } from '$lib/server/whatsapp/rate-limiter.js';

// GET: Webhook verification
export const GET: RequestHandler = async ({ url }) => {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_CONFIG.verifyToken) {
    console.log('Webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
};

// POST: Receive messages
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIp, 30, 60000)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    const rawBody = await request.text();

    // Verify signature if app secret is configured
    if (WHATSAPP_CONFIG.appSecret) {
      const signature = request.headers.get('x-hub-signature-256');
      const expectedSignature =
        'sha256=' +
        crypto.createHmac('sha256', WHATSAPP_CONFIG.appSecret).update(rawBody).digest('hex');

      if (signature !== expectedSignature) {
        console.warn('Invalid webhook signature');
        return new Response('Forbidden', { status: 403 });
      }
    }

    const payload: WebhookPayload = JSON.parse(rawBody);

    // Process messages asynchronously
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const messages = change.value.messages || [];
        for (const message of messages) {
          await processMessage(message);
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('OK', { status: 200 }); // Always return 200 to acknowledge
  }
};

async function processMessage(message: IncomingMessage): Promise<void> {
  console.log(`Received message from ${message.from}:`, message);

  // Echo text messages as example
  if (isTextMessage(message)) {
    await sendTextMessage(message.from, `You said: ${message.text.body}`);
  }
}
