import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFormById, createSubmission } from '$lib/server/forms';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const form = await getFormById(params.id);
	if (!form || form.status !== 'published') {
		throw error(404, 'Form not found');
	}

	const body = await request.json();
	const data = body.data ?? {};

	await createSubmission({
		tenant_id: form.tenant_id,
		form_id: form.id,
		data: JSON.stringify(data) as any,
		metadata: JSON.stringify({
			user_agent: request.headers.get('user-agent') ?? '',
			submitted_via: 'inline'
		}) as any
	});

	return json({ success: true });
};
