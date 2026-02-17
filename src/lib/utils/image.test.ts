import { describe, it, expect } from 'vitest';
import { toWebpUrl } from './image.js';

describe('toWebpUrl', () => {
	it('converts .jpg to .webp', () => {
		expect(toWebpUrl('/images/hero.jpg')).toBe('/images/hero.webp');
	});

	it('converts .jpeg to .webp', () => {
		expect(toWebpUrl('/images/photo.jpeg')).toBe('/images/photo.webp');
	});

	it('converts .png to .webp', () => {
		expect(toWebpUrl('/images/logo.png')).toBe('/images/logo.webp');
	});

	it('is a no-op for .webp (already WebP)', () => {
		expect(toWebpUrl('/images/instructors/deepa-rao.webp')).toBe('/images/instructors/deepa-rao.webp');
	});

	it('preserves query string', () => {
		expect(toWebpUrl('/images/hero.jpg?v=1')).toBe('/images/hero.webp?v=1');
	});

	it('returns empty string unchanged', () => {
		expect(toWebpUrl('')).toBe('');
	});

	it('returns null unchanged', () => {
		expect(toWebpUrl(null)).toBe(null);
	});

	it('returns undefined unchanged', () => {
		expect(toWebpUrl(undefined)).toBe(undefined);
	});

	it('converts external URL', () => {
		expect(toWebpUrl('https://cdn.example.com/img.jpg')).toBe('https://cdn.example.com/img.webp');
	});
});
