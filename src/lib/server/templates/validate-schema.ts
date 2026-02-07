interface SchemaField {
	key: string;
	type: string;
	label: string;
	[k: string]: unknown;
}

interface Schema {
	fields: SchemaField[];
}

interface ValidationResult {
	ok: boolean;
	error?: string;
}

const VALID_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validate template schema for duplicate keys and invalid key names.
 */
export function validateSchema(schema: Schema): ValidationResult {
	const keys = new Set<string>();

	for (const field of schema.fields ?? []) {
		if (!field.key) {
			return { ok: false, error: 'Field key is required' };
		}
		if (!VALID_KEY_PATTERN.test(field.key)) {
			return { ok: false, error: `Invalid key "${field.key}": must start with letter/underscore and contain only alphanumeric/underscore` };
		}
		if (keys.has(field.key)) {
			return { ok: false, error: `Duplicate key: ${field.key}` };
		}
		keys.add(field.key);
	}

	return { ok: true };
}
