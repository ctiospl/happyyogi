import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Default to OpenRouter, but support direct providers
export function createProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('[AI] No OPENROUTER_API_KEY set. AI features will not work in production.');
  }

  return createOpenRouter({
    apiKey: apiKey || 'dummy-key-for-dev'
  });
}

export const openrouter = createProvider();

// Default model
export const defaultModel = openrouter('anthropic/claude-3.5-sonnet');
