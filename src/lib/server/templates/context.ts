/**
 * Template Context Builder
 *
 * Builds the `context` object available to all templates.
 * Contains tenant, brand, page info + safe helper functions.
 */

import type { Tenant, Page } from '$lib/server/db/schema';

export interface TemplateContext {
	tenant: {
		id: string;
		name: string;
		slug: string;
		domain: string | null;
	};
	brand: {
		name: string;
		logo_url: string | null;
		colors: Record<string, string>;
	};
	page?: {
		slug: string;
		title: string;
	};
	helpers: {
		formatDate: (date: string | Date, locale?: string) => string;
		formatCurrency: (amountPaise: number, currency?: string) => string;
	};
}

/**
 * Build template context from tenant + optional page data.
 * All data is serializable (no DB connections, no side effects).
 */
export function buildTemplateContext(tenant: Tenant, page?: Page): TemplateContext {
	const theme = (typeof tenant.theme === 'string' ? JSON.parse(tenant.theme) : tenant.theme) || {};

	return {
		tenant: {
			id: tenant.id,
			name: tenant.name,
			slug: tenant.slug,
			domain: tenant.domain
		},
		brand: {
			name: theme.brand_name || tenant.name,
			logo_url: theme.logo_url || tenant.logo_url || null,
			colors: theme.colors || {}
		},
		page: page
			? { slug: page.slug, title: page.title }
			: undefined,
		helpers: {
			formatDate: (date: string | Date, locale = 'en-IN') => {
				try {
					const d = typeof date === 'string' ? new Date(date) : date;
					return d.toLocaleDateString(locale, {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					});
				} catch {
					return String(date);
				}
			},
			formatCurrency: (amountPaise: number, currency = 'INR') => {
				try {
					return new Intl.NumberFormat('en-IN', {
						style: 'currency',
						currency,
						minimumFractionDigits: 0
					}).format(amountPaise / 100);
				} catch {
					return `₹${(amountPaise / 100).toFixed(0)}`;
				}
			}
		}
	};
}
