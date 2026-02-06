/**
 * Structured content block types for database-driven pages
 * Maps to Svelte section components for exact visual rendering
 */

// Base block with common properties
interface BaseBlock {
	id?: string;
	order?: number;
}

// CTA link structure
export interface CtaLink {
	text: string;
	href: string;
}

// Service item for services grid
export interface ServiceItem {
	title: string;
	description: string;
	icon: string;
	href?: string;
}

// Testimonial item
export interface TestimonialItem {
	quote: string;
	author: string;
	role: string;
	avatar?: string;
}

// Instructor item
export interface InstructorItem {
	name: string;
	role?: string;
	image: string;
	specialty?: string;
	slug?: string;
	bio?: string;
	specializations?: string[];
	credentials?: string[];
}

// Value item for values grid
export interface ValueItem {
	title: string;
	description: string;
	icon?: string;
}

// Hero section - full-width header with CTA
export interface HeroBlock extends BaseBlock {
	type: 'hero';
	headline: string;
	subheadline?: string;
	cta?: CtaLink;
	secondaryCta?: CtaLink;
	location?: string;
	backgroundImage?: string;
}

// Services grid - icon cards showcasing offerings
export interface ServicesGridBlock extends BaseBlock {
	type: 'services-grid';
	headline: string;
	subheadline?: string;
	services: ServiceItem[];
	featureImage?: string;
}

// About snippet - company info with highlights
export interface AboutSnippetBlock extends BaseBlock {
	type: 'about-snippet';
	headline: string;
	content: string;
	highlights?: string[];
	cta?: CtaLink;
	image?: string;
	stats?: { value: string; label: string }[];
}

// Testimonial carousel/grid
export interface TestimonialCarouselBlock extends BaseBlock {
	type: 'testimonial-carousel';
	headline: string;
	testimonials: TestimonialItem[];
}

// CTA banner - full-width call to action
export interface CtaBannerBlock extends BaseBlock {
	type: 'cta-banner';
	headline: string;
	subheadline?: string;
	cta?: CtaLink;
	secondaryCta?: CtaLink;
	backgroundImage?: string;
	showInstructors?: boolean;
}

// Instructor grid - team showcase
export interface InstructorGridBlock extends BaseBlock {
	type: 'instructor-grid';
	heading: string;
	subheading?: string;
	instructors: InstructorItem[];
	cta?: CtaLink;
}

// Values grid - mission/values display
export interface ValuesGridBlock extends BaseBlock {
	type: 'values-grid';
	heading: string;
	values: ValueItem[];
}

// Story section - long-form content
export interface StoryBlock extends BaseBlock {
	type: 'story';
	heading: string;
	subheading?: string;
	content: string[];
	image?: string;
}

// Raw HTML block - for custom content
export interface HtmlBlock extends BaseBlock {
	type: 'html';
	html: string;
	css?: string;
}

// Inline form block
export interface FormBlock extends BaseBlock {
	type: 'form';
	form_id: string;
	fields: unknown;
	settings: unknown;
	conditional_rules: unknown;
}

// Union of all block types
export type ContentBlock =
	| HeroBlock
	| ServicesGridBlock
	| AboutSnippetBlock
	| TestimonialCarouselBlock
	| CtaBannerBlock
	| InstructorGridBlock
	| ValuesGridBlock
	| StoryBlock
	| HtmlBlock
	| FormBlock;

// Page content wrapper
export interface PageContent {
	version: number;
	blocks: ContentBlock[];
}

// Type guards
export function isHeroBlock(block: ContentBlock): block is HeroBlock {
	return block.type === 'hero';
}

export function isServicesGridBlock(block: ContentBlock): block is ServicesGridBlock {
	return block.type === 'services-grid';
}

export function isAboutSnippetBlock(block: ContentBlock): block is AboutSnippetBlock {
	return block.type === 'about-snippet';
}

export function isTestimonialCarouselBlock(block: ContentBlock): block is TestimonialCarouselBlock {
	return block.type === 'testimonial-carousel';
}

export function isCtaBannerBlock(block: ContentBlock): block is CtaBannerBlock {
	return block.type === 'cta-banner';
}

export function isInstructorGridBlock(block: ContentBlock): block is InstructorGridBlock {
	return block.type === 'instructor-grid';
}

export function isValuesGridBlock(block: ContentBlock): block is ValuesGridBlock {
	return block.type === 'values-grid';
}

export function isStoryBlock(block: ContentBlock): block is StoryBlock {
	return block.type === 'story';
}

export function isHtmlBlock(block: ContentBlock): block is HtmlBlock {
	return block.type === 'html';
}
