import type { FormFieldType, FormFieldDef } from '$lib/server/db/schema';
import {
	Type,
	Mail,
	Phone,
	TextCursorInput,
	Hash,
	ChevronDown,
	ListChecks,
	SquareCheck,
	Circle,
	CalendarDays,
	CalendarRange,
	Clock,
	Upload,
	Star,
	SlidersHorizontal,
	MapPin,
	PenLine,
	Heading
} from '@lucide/svelte';
import type { Component } from 'svelte';

export interface FieldTypeInfo {
	type: FormFieldType;
	label: string;
	icon: Component;
	defaultConfig: Partial<FormFieldDef>;
}

export const FIELD_TYPES: FieldTypeInfo[] = [
	{
		type: 'text',
		label: 'Text',
		icon: Type,
		defaultConfig: { placeholder: 'Enter text...' }
	},
	{
		type: 'email',
		label: 'Email',
		icon: Mail,
		defaultConfig: { placeholder: 'email@example.com' }
	},
	{
		type: 'phone',
		label: 'Phone',
		icon: Phone,
		defaultConfig: { placeholder: '+1 (555) 000-0000' }
	},
	{
		type: 'textarea',
		label: 'Long Text',
		icon: TextCursorInput,
		defaultConfig: { placeholder: 'Enter details...' }
	},
	{
		type: 'number',
		label: 'Number',
		icon: Hash,
		defaultConfig: { placeholder: '0' }
	},
	{
		type: 'select',
		label: 'Dropdown',
		icon: ChevronDown,
		defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
	},
	{
		type: 'multi_select',
		label: 'Multi Select',
		icon: ListChecks,
		defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
	},
	{
		type: 'checkbox',
		label: 'Checkbox',
		icon: SquareCheck,
		defaultConfig: {}
	},
	{
		type: 'radio',
		label: 'Radio',
		icon: Circle,
		defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
	},
	{
		type: 'date',
		label: 'Date',
		icon: CalendarDays,
		defaultConfig: {}
	},
	{
		type: 'date_range',
		label: 'Date Range',
		icon: CalendarRange,
		defaultConfig: {}
	},
	{
		type: 'time',
		label: 'Time',
		icon: Clock,
		defaultConfig: {}
	},
	{
		type: 'file',
		label: 'File Upload',
		icon: Upload,
		defaultConfig: { validation: { accept: 'image/*,.pdf,.doc,.docx', max_size_mb: 10 } }
	},
	{
		type: 'rating',
		label: 'Rating',
		icon: Star,
		defaultConfig: { scale_max: 5 }
	},
	{
		type: 'scale',
		label: 'Scale',
		icon: SlidersHorizontal,
		defaultConfig: { scale_min: 1, scale_max: 10, scale_labels: { min: 'Low', max: 'High' } }
	},
	{
		type: 'address',
		label: 'Address',
		icon: MapPin,
		defaultConfig: { address_fields: ['street', 'city', 'state', 'zip', 'country'] }
	},
	{
		type: 'signature',
		label: 'Signature',
		icon: PenLine,
		defaultConfig: {}
	},
	{
		type: 'heading',
		label: 'Heading',
		icon: Heading,
		defaultConfig: { label: 'Section Title' }
	}
];

export const FIELD_TYPE_MAP = new Map(FIELD_TYPES.map((ft) => [ft.type, ft]));

export function createFieldDef(type: FormFieldType): FormFieldDef {
	const info = FIELD_TYPE_MAP.get(type);
	return {
		id: crypto.randomUUID(),
		type,
		label: info?.label ?? type,
		...info?.defaultConfig
	};
}
