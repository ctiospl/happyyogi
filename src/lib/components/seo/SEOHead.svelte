<script lang="ts" module>
	import type {
		OrganizationSchema,
		LocalBusinessSchema,
		WebSiteSchema
	} from "./StructuredData.svelte";

	export type Props = {
		title: string;
		description: string;
		canonicalUrl?: string;
		ogImage?: string;
		ogType?: "website" | "article" | "profile";
		twitterCard?: "summary" | "summary_large_image";
		noindex?: boolean;
		organization?: OrganizationSchema;
		localBusiness?: LocalBusinessSchema;
		website?: WebSiteSchema;
	};
</script>

<script lang="ts">
	import StructuredData from "./StructuredData.svelte";
	import { PUBLIC_APP_URL, PUBLIC_SITE_NAME } from "$env/static/public";

	const BASE_URL = PUBLIC_APP_URL || "https://happyyogi.in";
	const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-default.jpg`;
	const SITE_NAME = PUBLIC_SITE_NAME || "Happy Yogi Shaala";

	let {
		title,
		description,
		canonicalUrl,
		ogImage = DEFAULT_OG_IMAGE,
		ogType = "website",
		twitterCard = "summary_large_image",
		noindex = false,
		organization,
		localBusiness,
		website
	}: Props = $props();

	const fullTitle = $derived(title === SITE_NAME ? title : `${title} | ${SITE_NAME}`);
	const resolvedCanonical = $derived(canonicalUrl ?? BASE_URL);
	const resolvedOgImage = $derived(ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="title" content={fullTitle} />
	<meta name="description" content={description} />
	<link rel="canonical" href={resolvedCanonical} />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={resolvedCanonical} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={resolvedOgImage} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_IN" />

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:url" content={resolvedCanonical} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={resolvedOgImage} />
</svelte:head>

<StructuredData {organization} {localBusiness} {website} />
