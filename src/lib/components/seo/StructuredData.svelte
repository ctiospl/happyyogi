<script lang="ts" module>
	export type OrganizationSchema = {
		name: string;
		url: string;
		logo?: string;
		description?: string;
		sameAs?: string[];
		contactPoint?: {
			telephone: string;
			contactType: string;
			areaServed?: string;
			availableLanguage?: string[];
		};
	};

	export type LocalBusinessSchema = {
		name: string;
		image?: string;
		url: string;
		telephone?: string;
		address: {
			streetAddress: string;
			addressLocality: string;
			addressRegion: string;
			postalCode: string;
			addressCountry: string;
		};
		geo?: {
			latitude: number;
			longitude: number;
		};
		openingHours?: string[];
		priceRange?: string;
	};

	export type WebSiteSchema = {
		name: string;
		url: string;
		searchUrl?: string;
	};

	export type Props = {
		organization?: OrganizationSchema;
		localBusiness?: LocalBusinessSchema;
		website?: WebSiteSchema;
	};
</script>

<script lang="ts">
	let { organization, localBusiness, website }: Props = $props();

	function buildOrganizationSchema(org: OrganizationSchema) {
		return {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: org.name,
			url: org.url,
			...(org.logo && { logo: org.logo }),
			...(org.description && { description: org.description }),
			...(org.sameAs && { sameAs: org.sameAs }),
			...(org.contactPoint && {
				contactPoint: {
					"@type": "ContactPoint",
					telephone: org.contactPoint.telephone,
					contactType: org.contactPoint.contactType,
					...(org.contactPoint.areaServed && { areaServed: org.contactPoint.areaServed }),
					...(org.contactPoint.availableLanguage && {
						availableLanguage: org.contactPoint.availableLanguage
					})
				}
			})
		};
	}

	function buildLocalBusinessSchema(biz: LocalBusinessSchema) {
		return {
			"@context": "https://schema.org",
			"@type": "YogaStudio",
			name: biz.name,
			url: biz.url,
			...(biz.image && { image: biz.image }),
			...(biz.telephone && { telephone: biz.telephone }),
			address: {
				"@type": "PostalAddress",
				streetAddress: biz.address.streetAddress,
				addressLocality: biz.address.addressLocality,
				addressRegion: biz.address.addressRegion,
				postalCode: biz.address.postalCode,
				addressCountry: biz.address.addressCountry
			},
			...(biz.geo && {
				geo: {
					"@type": "GeoCoordinates",
					latitude: biz.geo.latitude,
					longitude: biz.geo.longitude
				}
			}),
			...(biz.openingHours && { openingHoursSpecification: biz.openingHours }),
			...(biz.priceRange && { priceRange: biz.priceRange })
		};
	}

	function buildWebSiteSchema(site: WebSiteSchema) {
		const schema: Record<string, unknown> = {
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: site.name,
			url: site.url
		};

		if (site.searchUrl) {
			schema.potentialAction = {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: site.searchUrl
				},
				"query-input": "required name=search_term_string"
			};
		}

		return schema;
	}

	const schemas = $derived.by(() => {
		const result: Record<string, unknown>[] = [];
		if (organization) result.push(buildOrganizationSchema(organization));
		if (localBusiness) result.push(buildLocalBusinessSchema(localBusiness));
		if (website) result.push(buildWebSiteSchema(website));
		return result;
	});
</script>

<svelte:head>
	{#each schemas as schema}
		{@html `<script type="application/ld+json">${JSON.stringify(schema).replace(/<\/script>/gi, '<\\/script>')}</script>`}
	{/each}
</svelte:head>
