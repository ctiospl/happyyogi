/**
 * Seed a default layout for a tenant using existing layout templates
 */

import { createLayout, getLayouts, setDefaultLayout } from '$lib/server/layouts';
import { getTenantTemplates } from '$lib/server/templates/crud';
import { seedLayoutTemplates } from '$lib/server/templates/seed';
import type { PageBlock } from '$lib/server/db/schema';

export interface LayoutSeedResult {
	created: boolean;
	layoutId: string | null;
	templatesSeedResult?: Awaited<ReturnType<typeof seedLayoutTemplates>>;
}

/**
 * Seed a default layout for a tenant.
 * Ensures layout templates exist, then creates a "Default" layout
 * with site-header and site-footer blocks pre-filled from sample data.
 */
export async function seedDefaultLayout(tenantId: string): Promise<LayoutSeedResult> {
	// Ensure layout templates are seeded first
	const templatesSeedResult = await seedLayoutTemplates(tenantId);

	// Check if any layouts exist already
	const existing = await getLayouts(tenantId);
	if (existing.length > 0) {
		const defaultLayout = existing.find((l) => l.is_default);
		return {
			created: false,
			layoutId: defaultLayout?.id ?? existing[0].id,
			templatesSeedResult
		};
	}

	// Get template IDs for header and footer
	const templates = await getTenantTemplates(tenantId);
	const headerTemplate = templates.find((t) => t.slug === 'site-header');
	const footerTemplate = templates.find((t) => t.slug === 'site-footer');

	const regions: Record<string, PageBlock[]> = {};

	if (headerTemplate) {
		regions.header = [
			{
				id: crypto.randomUUID(),
				template_id: headerTemplate.id,
				props: (headerTemplate.sample_data as Record<string, unknown>) ?? {}
			}
		];
	}

	if (footerTemplate) {
		regions.footer = [
			{
				id: crypto.randomUUID(),
				template_id: footerTemplate.id,
				props: (footerTemplate.sample_data as Record<string, unknown>) ?? {}
			}
		];
	}

	const layout = await createLayout({
		tenant_id: tenantId,
		name: 'Default Layout',
		slug: 'default',
		is_default: true,
		regions: JSON.stringify(regions) as any,
		status: 'draft',
		published_at: null,
		updated_at: new Date()
	});

	await setDefaultLayout(tenantId, layout.id);

	return {
		created: true,
		layoutId: layout.id,
		templatesSeedResult
	};
}
