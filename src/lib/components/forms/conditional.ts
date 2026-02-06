import type { FormConditionalRule } from '$lib/server/db/schema';

export function evaluateRules(
	rules: FormConditionalRule[],
	formData: Record<string, unknown>
): Set<string> {
	const hidden = new Set<string>();

	for (const rule of rules) {
		const value = formData[rule.field_id];
		const strValue = value != null ? String(value) : '';
		let matches = false;

		switch (rule.operator) {
			case 'equals':
				matches = strValue === rule.value;
				break;
			case 'not_equals':
				matches = strValue !== rule.value;
				break;
			case 'contains':
				matches = strValue.includes(rule.value);
				break;
			case 'not_empty':
				matches = strValue !== '';
				break;
			case 'empty':
				matches = strValue === '';
				break;
			case 'gt':
				matches = Number(strValue) > Number(rule.value);
				break;
			case 'lt':
				matches = Number(strValue) < Number(rule.value);
				break;
		}

		if (rule.action === 'show') {
			// show target only when condition matches, hide otherwise
			if (!matches) hidden.add(rule.target_field_id);
		} else {
			// hide target when condition matches
			if (matches) hidden.add(rule.target_field_id);
		}
	}

	return hidden;
}
