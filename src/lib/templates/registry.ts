/**
 * Template Registry
 *
 * Maps template slugs to Svelte components.
 * Templates are file-based for Phase 1 (enables hot reload in dev).
 */

import type { Component } from 'svelte';

// Import all block templates
// These are eagerly loaded for SSR compatibility
import Hero from './blocks/Hero.svelte';
import ServicesGrid from './blocks/ServicesGrid.svelte';
import AboutSnippet from './blocks/AboutSnippet.svelte';
import Testimonials from './blocks/Testimonials.svelte';
import CtaBanner from './blocks/CtaBanner.svelte';
import InstructorGrid from './blocks/InstructorGrid.svelte';
import ValuesGrid from './blocks/ValuesGrid.svelte';
import Story from './blocks/Story.svelte';

// Template registry - maps slug to component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const templateRegistry: Record<string, Component<any>> = {
	hero: Hero,
	'services-grid': ServicesGrid,
	'about-snippet': AboutSnippet,
	testimonials: Testimonials,
	'cta-banner': CtaBanner,
	'instructor-grid': InstructorGrid,
	'values-grid': ValuesGrid,
	story: Story
};

/**
 * Get a template component by slug
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTemplate(slug: string): Component<any> | null {
	return templateRegistry[slug] || null;
}

/**
 * Check if a template exists
 */
export function hasTemplate(slug: string): boolean {
	return slug in templateRegistry;
}

/**
 * Get all available template slugs
 */
export function getTemplateSlugs(): string[] {
	return Object.keys(templateRegistry);
}
