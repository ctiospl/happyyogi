import { Lucia } from 'lucia';
import { KyselyAdapter } from '@lucia-auth/adapter-kysely';
import type { DB } from '$lib/server/db';

export function createLucia(db: DB) {
	const adapter = new KyselyAdapter(db, {
		user: 'user',
		session: 'session'
	});

	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: process.env.NODE_ENV === 'production'
			}
		},
		getUserAttributes: (attributes) => {
			return {
				email: attributes.email
			};
		}
	});
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof createLucia>;
		DatabaseUserAttributes: {
			email: string;
		};
	}
}
