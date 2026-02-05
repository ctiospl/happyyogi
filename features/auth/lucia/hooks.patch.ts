// Example hooks.server.ts integration with Lucia auth
// Copy relevant parts to your src/hooks.server.ts

import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from '$lib/server/auth/middleware';
import { i18n } from '$lib/i18n';

// Compose handles with sequence()
export const handle = sequence(i18n.handle(), authHandle);

// Don't forget to add types to app.d.ts:
// declare global {
//   namespace App {
//     interface Locals {
//       user: import('lucia').User | null;
//       session: import('lucia').Session | null;
//     }
//   }
// }
