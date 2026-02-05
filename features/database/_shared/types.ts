import type { Kysely } from 'kysely';

// Base database interface - extend this in your app
export interface Database {
	// Add your tables here
}

// Generic DB instance type
export type DB = Kysely<Database>;

// Helper for extending the database type
export type ExtendDatabase<T> = Database & T;
