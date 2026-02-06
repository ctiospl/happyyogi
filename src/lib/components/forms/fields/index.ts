import type { FormFieldType } from '$lib/server/db/schema';
import type { Component } from 'svelte';
import TextField from './TextField.svelte';
import TextareaField from './TextareaField.svelte';
import NumberField from './NumberField.svelte';
import SelectField from './SelectField.svelte';
import MultiSelectField from './MultiSelectField.svelte';
import CheckboxField from './CheckboxField.svelte';
import RadioField from './RadioField.svelte';
import DateField from './DateField.svelte';
import DateRangeField from './DateRangeField.svelte';
import TimeField from './TimeField.svelte';
import FileField from './FileField.svelte';
import RatingField from './RatingField.svelte';
import ScaleField from './ScaleField.svelte';
import AddressField from './AddressField.svelte';
import SignatureField from './SignatureField.svelte';

export const FIELD_COMPONENT_MAP: Record<FormFieldType, Component<any>> = {
	text: TextField,
	email: TextField,
	phone: TextField,
	textarea: TextareaField,
	number: NumberField,
	select: SelectField,
	multi_select: MultiSelectField,
	checkbox: CheckboxField,
	radio: RadioField,
	date: DateField,
	date_range: DateRangeField,
	time: TimeField,
	file: FileField,
	rating: RatingField,
	scale: ScaleField,
	address: AddressField,
	signature: SignatureField,
	heading: TextField // heading renders differently in FormRenderer
};

export {
	TextField,
	TextareaField,
	NumberField,
	SelectField,
	MultiSelectField,
	CheckboxField,
	RadioField,
	DateField,
	DateRangeField,
	TimeField,
	FileField,
	RatingField,
	ScaleField,
	AddressField,
	SignatureField
};
