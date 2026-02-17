export function toWebpUrl(url: string | null | undefined): string | null | undefined {
	if (!url) return url;
	// Already WebP — no change (handles /images/instructors/*.webp)
	if (/\.webp(\?.*)?$/i.test(url)) return url;
	return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, (_, _ext, qs) => `.webp${qs ?? ''}`);
}
