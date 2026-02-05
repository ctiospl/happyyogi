import type { PageServerLoad, Actions } from './$types';
import { getTenantTemplates, createTemplate } from '$lib/server/templates/crud';
import { seedCoreTemplates, hasCoreTemplates } from '$lib/server/templates/seed';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		throw error(404, 'Tenant not found');
	}

	if (locals.tenantLink?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const templates = await getTenantTemplates(locals.tenant.id);
	const hasCore = await hasCoreTemplates(locals.tenant.id);

	return {
		templates,
		tenant: locals.tenant,
		hasCoreTemplates: hasCore
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const category = (formData.get('category') as string) || 'section';

		if (!name || !slug) {
			return fail(400, { error: 'Name and slug are required' });
		}

		const template = await createTemplate({
			tenant_id: locals.tenant.id,
			name,
			slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
			category: category as 'layout' | 'section' | 'component' | 'custom',
			source_code: `<script>
  let { title = 'Hello World' } = $props();
</script>

<section class="py-16 px-4">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-3xl font-bold mb-4">{title}</h2>
    <p class="text-muted-foreground">Edit this template to create your content.</p>
  </div>
</section>`,
			schema: {
				fields: [
					{
						key: 'title',
						type: 'text',
						label: 'Title',
						required: true,
						placeholder: 'Enter title'
					}
				]
			},
			sample_data: { title: 'Hello World' },
			updated_at: new Date()
		});

		throw redirect(302, `/admin/templates/${template.id}`);
	},

	seed: async ({ locals }) => {
		if (!locals.tenant || locals.tenantLink?.role !== 'admin') {
			return fail(403, { error: 'Not authorized' });
		}

		const result = await seedCoreTemplates(locals.tenant.id);

		if (result.errors.length > 0) {
			return fail(500, {
				error: `Seeding failed for: ${result.errors.map((e) => e.slug).join(', ')}`,
				seedResult: result
			});
		}

		return {
			success: true,
			seedResult: result
		};
	}
};
