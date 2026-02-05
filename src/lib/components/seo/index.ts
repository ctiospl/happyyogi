export { default as SEOHead } from './SEOHead.svelte';
export { default as StructuredData } from './StructuredData.svelte';

// Re-export types from module scripts
export type {
	OrganizationSchema,
	LocalBusinessSchema,
	WebSiteSchema
} from './StructuredData.svelte';
