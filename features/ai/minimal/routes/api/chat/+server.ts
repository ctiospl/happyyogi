import { streamText } from 'ai';
import type { RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { defaultModel } from '$lib/server/ai/index.js';

// Validate incoming messages
const messageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(50000)
      })
    )
    .max(100)
});

export const POST: RequestHandler = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Invalid message format', { status: 400 });
  }

  const result = streamText({
    model: defaultModel,
    messages: parsed.data.messages
  });

  return result.toDataStreamResponse();
};
