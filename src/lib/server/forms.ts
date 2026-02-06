import { db } from '$lib/server/db';
import type {
	Form,
	NewForm,
	FormUpdate,
	FormStatus,
	FormSubmission,
	NewFormSubmission,
	FormFieldDef
} from '$lib/server/db/schema';

// ============================================
// FORMS CRUD
// ============================================

export async function getForms(tenantId: string, status?: FormStatus): Promise<Form[]> {
	let query = db.selectFrom('forms').where('tenant_id', '=', tenantId);

	if (status) {
		query = query.where('status', '=', status);
	}

	return query.selectAll().orderBy('created_at', 'desc').execute();
}

export async function getFormById(id: string): Promise<Form | null> {
	const form = await db
		.selectFrom('forms')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirst();

	return form ?? null;
}

export async function getFormBySlug(tenantId: string, slug: string): Promise<Form | null> {
	const form = await db
		.selectFrom('forms')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', slug)
		.selectAll()
		.executeTakeFirst();

	return form ?? null;
}

export async function createForm(data: NewForm): Promise<Form> {
	const [form] = await db
		.insertInto('forms')
		.values(data)
		.returningAll()
		.execute();

	return form;
}

export async function updateForm(id: string, data: FormUpdate): Promise<Form | null> {
	const [updated] = await db
		.updateTable('forms')
		.set({ ...data, updated_at: new Date() })
		.where('id', '=', id)
		.returningAll()
		.execute();

	return updated ?? null;
}

export async function publishForm(id: string): Promise<Form | null> {
	return updateForm(id, { status: 'published' });
}

export async function archiveForm(id: string): Promise<Form | null> {
	return updateForm(id, { status: 'archived' });
}

export async function deleteForm(id: string): Promise<void> {
	await db.deleteFrom('forms').where('id', '=', id).execute();
}

export async function isFormSlugAvailable(
	tenantId: string,
	slug: string,
	excludeFormId?: string
): Promise<boolean> {
	let query = db
		.selectFrom('forms')
		.where('tenant_id', '=', tenantId)
		.where('slug', '=', slug);

	if (excludeFormId) {
		query = query.where('id', '!=', excludeFormId);
	}

	const existing = await query.selectAll().executeTakeFirst();
	return !existing;
}

// ============================================
// SUBMISSIONS CRUD
// ============================================

export async function getFormSubmissions(
	formId: string,
	{ limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<FormSubmission[]> {
	return db
		.selectFrom('form_submissions')
		.where('form_id', '=', formId)
		.selectAll()
		.orderBy('submitted_at', 'desc')
		.limit(limit)
		.offset(offset)
		.execute();
}

export async function getSubmissionCount(formId: string): Promise<number> {
	const result = await db
		.selectFrom('form_submissions')
		.where('form_id', '=', formId)
		.select(db.fn.countAll<number>().as('count'))
		.executeTakeFirst();

	return result?.count ?? 0;
}

export async function createSubmission(data: NewFormSubmission): Promise<FormSubmission> {
	const [submission] = await db
		.insertInto('form_submissions')
		.values(data)
		.returningAll()
		.execute();

	return submission;
}

export async function deleteSubmission(id: string): Promise<void> {
	await db.deleteFrom('form_submissions').where('id', '=', id).execute();
}

export async function exportSubmissions(
	formId: string,
	format: 'csv' | 'json'
): Promise<{ data: string; contentType: string; filename: string }> {
	const form = await getFormById(formId);
	if (!form) throw new Error('Form not found');

	const submissions = await db
		.selectFrom('form_submissions')
		.where('form_id', '=', formId)
		.selectAll()
		.orderBy('submitted_at', 'asc')
		.execute();

	const fields = (form.fields as unknown as FormFieldDef[]) || [];
	const fieldKeys = fields.map((f) => f.id);
	const fieldLabels = fields.map((f) => f.label);

	if (format === 'json') {
		const rows = submissions.map((s) => {
			const row: Record<string, unknown> = { submitted_at: s.submitted_at };
			for (const key of fieldKeys) {
				row[key] = (s.data as Record<string, unknown>)[key] ?? '';
			}
			return row;
		});
		return {
			data: JSON.stringify(rows, null, 2),
			contentType: 'application/json',
			filename: `${form.slug}-submissions.json`
		};
	}

	// CSV
	const headers = ['Submitted At', ...fieldLabels];
	const csvRows = [headers.map(escapeCsv).join(',')];

	for (const s of submissions) {
		const data = s.data as Record<string, unknown>;
		const row = [
			new Date(s.submitted_at as unknown as string).toISOString(),
			...fieldKeys.map((key) => {
				const val = data[key];
				if (val == null) return '';
				if (typeof val === 'object') return JSON.stringify(val);
				return String(val);
			})
		];
		csvRows.push(row.map(escapeCsv).join(','));
	}

	return {
		data: csvRows.join('\n'),
		contentType: 'text/csv',
		filename: `${form.slug}-submissions.csv`
	};
}

function escapeCsv(val: string): string {
	if (val.includes(',') || val.includes('"') || val.includes('\n')) {
		return `"${val.replace(/"/g, '""')}"`;
	}
	return val;
}
