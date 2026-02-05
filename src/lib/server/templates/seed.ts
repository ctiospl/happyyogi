/**
 * Seed core section templates from existing Svelte components
 * Converts TypeScript interfaces to TemplateSchema format
 */

import { createTemplate, getTenantTemplates } from './crud';
import type { TemplateSchema, TemplateSchemaField } from '$lib/server/db/schema';

// Sample data from existing content files
import { homePage } from '$lib/content/pages/home';
import { aboutPage } from '$lib/content/pages/about';

// ============================================
// SCHEMA DEFINITIONS
// ============================================

const ctaFields: TemplateSchemaField[] = [
	{ key: 'text', type: 'text', label: 'Button Text', required: true },
	{ key: 'href', type: 'text', label: 'Button Link', required: true }
];

const heroSchema: TemplateSchema = {
	fields: [
		{ key: 'headline', type: 'text', label: 'Headline', required: true },
		{ key: 'subheadline', type: 'textarea', label: 'Subheadline' },
		{ key: 'backgroundImage', type: 'image', label: 'Background Image' },
		{ key: 'location', type: 'text', label: 'Location' },
		{ key: 'cta', type: 'object', label: 'Primary CTA', fields: ctaFields },
		{ key: 'secondaryCta', type: 'object', label: 'Secondary CTA', fields: ctaFields }
	]
};

const servicesGridSchema: TemplateSchema = {
	fields: [
		{ key: 'headline', type: 'text', label: 'Headline', required: true },
		{ key: 'subheadline', type: 'textarea', label: 'Subheadline' },
		{ key: 'featureImage', type: 'image', label: 'Feature Image' },
		{
			key: 'services',
			type: 'array',
			label: 'Services',
			itemType: 'object',
			fields: [
				{ key: 'title', type: 'text', label: 'Title', required: true },
				{ key: 'description', type: 'textarea', label: 'Description', required: true },
				{
					key: 'icon',
					type: 'select',
					label: 'Icon',
					options: [
						{ value: 'video', label: 'Video' },
						{ value: 'users', label: 'Users' },
						{ value: 'activity', label: 'Activity' },
						{ value: 'user', label: 'User' },
						{ value: 'briefcase', label: 'Briefcase' },
						{ value: 'calendar', label: 'Calendar' },
						{ value: 'home', label: 'Home' }
					]
				},
				{ key: 'href', type: 'text', label: 'Link' }
			]
		}
	]
};

const aboutSnippetSchema: TemplateSchema = {
	fields: [
		{ key: 'headline', type: 'text', label: 'Headline', required: true },
		{ key: 'content', type: 'textarea', label: 'Content', required: true },
		{ key: 'image', type: 'image', label: 'Image' },
		{
			key: 'highlights',
			type: 'array',
			label: 'Highlights',
			itemType: 'text'
		},
		{ key: 'cta', type: 'object', label: 'CTA', fields: ctaFields },
		{
			key: 'stats',
			type: 'array',
			label: 'Stats',
			itemType: 'object',
			fields: [
				{ key: 'value', type: 'text', label: 'Value', required: true },
				{ key: 'label', type: 'text', label: 'Label', required: true }
			]
		}
	]
};

const testimonialCarouselSchema: TemplateSchema = {
	fields: [
		{ key: 'headline', type: 'text', label: 'Headline', required: true },
		{
			key: 'testimonials',
			type: 'array',
			label: 'Testimonials',
			itemType: 'object',
			fields: [
				{ key: 'quote', type: 'textarea', label: 'Quote', required: true },
				{ key: 'author', type: 'text', label: 'Author', required: true },
				{ key: 'role', type: 'text', label: 'Role' },
				{ key: 'avatar', type: 'image', label: 'Avatar' }
			]
		}
	]
};

const ctaBannerSchema: TemplateSchema = {
	fields: [
		{ key: 'headline', type: 'text', label: 'Headline', required: true },
		{ key: 'subheadline', type: 'textarea', label: 'Subheadline' },
		{ key: 'backgroundImage', type: 'image', label: 'Background Image' },
		{ key: 'cta', type: 'object', label: 'Primary CTA', fields: ctaFields },
		{ key: 'secondaryCta', type: 'object', label: 'Secondary CTA', fields: ctaFields },
		{ key: 'showInstructors', type: 'boolean', label: 'Show Instructors' }
	]
};

const instructorGridSchema: TemplateSchema = {
	fields: [
		{ key: 'heading', type: 'text', label: 'Heading', required: true },
		{ key: 'subheading', type: 'textarea', label: 'Subheading' },
		{ key: 'cta', type: 'object', label: 'CTA', fields: ctaFields },
		{
			key: 'instructors',
			type: 'array',
			label: 'Instructors',
			itemType: 'object',
			fields: [
				{ key: 'name', type: 'text', label: 'Name', required: true },
				{ key: 'role', type: 'text', label: 'Role' },
				{ key: 'image', type: 'image', label: 'Image', required: true },
				{ key: 'specialty', type: 'text', label: 'Specialty' },
				{ key: 'slug', type: 'text', label: 'Slug' },
				{ key: 'bio', type: 'textarea', label: 'Bio' },
				{ key: 'specializations', type: 'array', label: 'Specializations', itemType: 'text' },
				{ key: 'credentials', type: 'array', label: 'Credentials', itemType: 'text' }
			]
		}
	]
};

const valuesGridSchema: TemplateSchema = {
	fields: [
		{ key: 'heading', type: 'text', label: 'Heading', required: true },
		{
			key: 'values',
			type: 'array',
			label: 'Values',
			itemType: 'object',
			fields: [
				{ key: 'title', type: 'text', label: 'Title', required: true },
				{ key: 'description', type: 'textarea', label: 'Description', required: true },
				{ key: 'icon', type: 'text', label: 'Icon' }
			]
		}
	]
};

const storySchema: TemplateSchema = {
	fields: [
		{ key: 'heading', type: 'text', label: 'Heading', required: true },
		{ key: 'subheading', type: 'textarea', label: 'Subheading' },
		{ key: 'image', type: 'image', label: 'Image' },
		{
			key: 'content',
			type: 'array',
			label: 'Paragraphs',
			itemType: 'text'
		}
	]
};

const htmlSchema: TemplateSchema = {
	fields: [
		{ key: 'html', type: 'textarea', label: 'HTML', required: true },
		{ key: 'css', type: 'textarea', label: 'CSS' }
	]
};

// ============================================
// TEMPLATE SOURCE CODE
// ============================================

const heroSource = `<script>
  let { headline, subheadline, cta, secondaryCta, location, backgroundImage } = $props();
</script>

<section class="relative min-h-[90vh] overflow-hidden">
  {#if backgroundImage}
    <div class="absolute inset-0">
      <img src={backgroundImage} alt="" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
    </div>
  {:else}
    <div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
  {/if}

  <div class="container relative z-10 mx-auto flex min-h-[90vh] items-center px-4 py-20">
    <div class="max-w-2xl">
      <h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
        {@html headline}
      </h1>
      {#if subheadline}
        <p class="mb-8 text-lg text-muted-foreground md:text-xl">{subheadline}</p>
      {/if}
      {#if cta || secondaryCta}
        <div class="flex flex-col gap-4 sm:flex-row">
          {#if cta}
            <a href={cta.href} class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-lg font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {cta.text}
            </a>
          {/if}
          {#if secondaryCta}
            <a href={secondaryCta.href} class="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-lg font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {secondaryCta.text}
            </a>
          {/if}
        </div>
      {/if}
      {#if location}
        <p class="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          {location}
        </p>
      {/if}
    </div>
  </div>

  <div class="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
      <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" class="fill-background"/>
    </svg>
  </div>
</section>`;

const servicesGridSource = `<script>
  let { headline, subheadline, services = [], featureImage } = $props();

  const iconMap = {
    video: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    activity: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    briefcase: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  };
</script>

<section class="py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="mb-12 text-center">
      <h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">{headline}</h2>
      {#if subheadline}
        <p class="text-lg text-muted-foreground">{subheadline}</p>
      {/if}
    </div>

    <div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div class="grid gap-4 sm:grid-cols-2">
        {#each services as service}
          <div class="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {@html iconMap[service.icon] || iconMap.activity}
            </div>
            <h3 class="mb-2 text-lg font-semibold text-foreground">{service.title}</h3>
            <p class="text-sm text-muted-foreground">{service.description}</p>
          </div>
        {/each}
      </div>

      {#if featureImage}
        <div class="relative hidden lg:block">
          <div class="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl"></div>
          <img src={featureImage} alt="" class="relative rounded-2xl object-cover shadow-lg" />
        </div>
      {/if}
    </div>
  </div>
</section>`;

const aboutSnippetSource = `<script>
  let { headline, content, highlights = [], cta, image, stats = [] } = $props();
</script>

<section class="relative overflow-hidden bg-muted/30 py-16 md:py-24">
  <div class="container relative z-10 mx-auto px-4">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      {#if image}
        <div class="relative">
          <div class="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-accent/30 to-primary/30 blur-3xl"></div>
          <div class="relative overflow-hidden rounded-2xl shadow-lg">
            <img src={image} alt="" class="w-full" />
          </div>
          {#if stats.length > 0}
            <div class="absolute -bottom-6 -right-6 rounded-xl bg-card p-4 shadow-lg">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-foreground">{stats[0].value}</p>
                  <p class="text-sm text-muted-foreground">{stats[0].label}</p>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div>
        <h2 class="mb-6 text-3xl font-bold text-foreground md:text-4xl">{headline}</h2>
        <p class="mb-8 text-lg text-muted-foreground">{content}</p>
        {#if highlights.length > 0}
          <ul class="mb-8 space-y-3">
            {#each highlights as highlight}
              <li class="flex items-center gap-3 text-foreground">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                {highlight}
              </li>
            {/each}
          </ul>
        {/if}
        {#if cta}
          <a href={cta.href} class="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">
            {cta.text}
          </a>
        {/if}
      </div>
    </div>
  </div>
</section>`;

const testimonialCarouselSource = `<script>
  let { headline, testimonials = [] } = $props();
</script>

<section class="bg-muted/30 py-16 md:py-24">
  <div class="container mx-auto px-4">
    <h2 class="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">{headline}</h2>
    <div class="grid gap-6 md:grid-cols-3">
      {#each testimonials as testimonial}
        <div class="relative overflow-hidden rounded-lg border bg-card">
          <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5"></div>
          <div class="relative p-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-primary/30"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            <p class="mb-4 italic text-muted-foreground">"{testimonial.quote}"</p>
            <div class="flex items-center gap-3">
              {#if testimonial.avatar}
                <img src={testimonial.avatar} alt={testimonial.author} class="h-10 w-10 rounded-full object-cover" />
              {:else}
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              {/if}
              <div>
                <p class="font-semibold text-foreground">{testimonial.author}</p>
                <p class="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>`;

const ctaBannerSource = `<script>
  let { headline, subheadline, cta, secondaryCta, backgroundImage, showInstructors, instructors = [] } = $props();
</script>

<section class="relative overflow-hidden py-16 md:py-24">
  {#if backgroundImage}
    <div class="absolute inset-0">
      <img src={backgroundImage} alt="" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-primary/85"></div>
    </div>
  {:else}
    <div class="absolute inset-0 bg-primary"></div>
  {/if}

  <div class="container relative z-10 mx-auto px-4">
    <div class="grid items-center gap-8 lg:grid-cols-2">
      <div class="text-primary-foreground">
        <h2 class="mb-4 text-3xl font-bold md:text-4xl">{headline}</h2>
        {#if subheadline}
          <p class="mb-8 text-lg opacity-90">{subheadline}</p>
        {/if}
        {#if cta || secondaryCta}
          <div class="flex flex-col gap-4 sm:flex-row">
            {#if cta}
              <a href={cta.href} class="inline-flex h-11 items-center justify-center rounded-md bg-secondary px-8 font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80">
                {cta.text}
              </a>
            {/if}
            {#if secondaryCta}
              <a href={secondaryCta.href} class="inline-flex h-11 items-center justify-center rounded-md border border-primary-foreground bg-transparent px-8 font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary-foreground hover:text-primary">
                {secondaryCta.text}
              </a>
            {/if}
          </div>
        {/if}
      </div>

      {#if showInstructors && instructors.length > 0}
        <div class="hidden justify-center lg:flex">
          <div class="flex -space-x-4">
            {#each instructors as instructor, i}
              <div class="h-20 w-20 overflow-hidden rounded-full border-4 border-primary shadow-lg" style="z-index: {instructors.length - i}">
                <img src={instructor.image} alt={instructor.name} class="h-full w-full object-cover" />
              </div>
            {/each}
            <div class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-accent text-accent-foreground shadow-lg">
              <span class="text-lg font-bold">You?</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>`;

const instructorGridSource = `<script>
  let { heading, subheading, instructors = [], cta } = $props();
</script>

<section class="py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="mb-12 text-center">
      <h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">{heading}</h2>
      {#if subheading}
        <p class="text-lg text-muted-foreground">{subheading}</p>
      {/if}
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      {#each instructors as instructor}
        <div class="group text-center">
          <div class="relative mx-auto mb-4 h-64 w-64 overflow-hidden rounded-2xl shadow-md">
            <img src={instructor.image} alt={instructor.name} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
            {#if instructor.specialty}
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p class="text-sm font-medium">{instructor.specialty}</p>
              </div>
            {/if}
          </div>
          <h3 class="text-xl font-semibold text-foreground">{instructor.name}</h3>
          {#if instructor.role}
            <p class="text-muted-foreground">{instructor.role}</p>
          {/if}
        </div>
      {/each}
    </div>

    {#if cta}
      <div class="mt-10 text-center">
        <a href={cta.href} class="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">
          {cta.text}
        </a>
      </div>
    {/if}
  </div>
</section>`;

const valuesGridSource = `<script>
  let { heading, values = [] } = $props();
</script>

<section class="py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="mb-12 text-center">
      <h2 class="text-3xl font-bold text-foreground md:text-4xl">{heading}</h2>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {#each values as value}
        <div class="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
          <h3 class="mb-3 text-lg font-semibold text-foreground">{value.title}</h3>
          <p class="text-sm text-muted-foreground">{value.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>`;

const storySource = `<script>
  let { heading, subheading, content = [], image } = $props();
</script>

<section class="py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 text-center">
        <h2 class="mb-2 text-3xl font-bold text-foreground md:text-4xl">{heading}</h2>
        {#if subheading}
          <p class="text-lg text-muted-foreground">{subheading}</p>
        {/if}
      </div>

      {#if image}
        <div class="mb-8">
          <img src={image} alt="" class="w-full rounded-2xl shadow-lg" />
        </div>
      {/if}

      <div class="prose prose-lg mx-auto text-muted-foreground">
        {#each content as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>
    </div>
  </div>
</section>`;

const htmlSource = `<script>
  let { html, css } = $props();
</script>

{#if css}
  {@html \`<style>\${css}</style>\`}
{/if}
{@html html}`;

// ============================================
// SAMPLE DATA (from existing content)
// ============================================

/** Remove `type` and `id` fields from section data for sample_data */
function omitSectionMeta<T extends { type?: unknown; id?: unknown }>(
	section: T | undefined
): Omit<T, 'type' | 'id'> | Record<string, never> {
	if (!section) return {};
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { type, id, ...rest } = section;
	return rest;
}

function extractSampleData() {
	const hero = homePage.sections.find((s) => s.type === 'hero');
	const services = homePage.sections.find((s) => s.type === 'services-grid');
	const about = homePage.sections.find((s) => s.type === 'about-snippet');
	const testimonials = homePage.sections.find((s) => s.type === 'testimonial-carousel');
	const ctaBanner = homePage.sections.find((s) => s.type === 'cta-banner');
	const story = aboutPage.sections.find((s) => s.type === 'story');
	const values = aboutPage.sections.find((s) => s.type === 'values-grid');
	const instructors = aboutPage.sections.find((s) => s.type === 'instructor-grid');

	return {
		hero: omitSectionMeta(hero),
		servicesGrid: omitSectionMeta(services),
		aboutSnippet: omitSectionMeta(about),
		testimonialCarousel: omitSectionMeta(testimonials),
		ctaBanner: omitSectionMeta(ctaBanner),
		story: omitSectionMeta(story),
		valuesGrid: omitSectionMeta(values),
		instructorGrid: omitSectionMeta(instructors),
		html: { html: '<div class="py-8 text-center">Custom HTML content</div>', css: '' }
	};
}

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

interface TemplateDefinition {
	slug: string;
	name: string;
	description: string;
	schema: TemplateSchema;
	source_code: string;
	sample_data_key: keyof ReturnType<typeof extractSampleData>;
}

const templateDefinitions: TemplateDefinition[] = [
	{
		slug: 'hero',
		name: 'Hero Section',
		description: 'Full-width hero with headline, CTAs, location, and optional background image',
		schema: heroSchema,
		source_code: heroSource,
		sample_data_key: 'hero'
	},
	{
		slug: 'services-grid',
		name: 'Services Grid',
		description: 'Grid of service cards with icons and optional feature image',
		schema: servicesGridSchema,
		source_code: servicesGridSource,
		sample_data_key: 'servicesGrid'
	},
	{
		slug: 'about-snippet',
		name: 'About Snippet',
		description: 'Company info with highlights, stats, and optional image',
		schema: aboutSnippetSchema,
		source_code: aboutSnippetSource,
		sample_data_key: 'aboutSnippet'
	},
	{
		slug: 'testimonial-carousel',
		name: 'Testimonial Carousel',
		description: 'Grid of testimonial cards with quotes and author info',
		schema: testimonialCarouselSchema,
		source_code: testimonialCarouselSource,
		sample_data_key: 'testimonialCarousel'
	},
	{
		slug: 'cta-banner',
		name: 'CTA Banner',
		description: 'Full-width call-to-action banner with optional background and instructor showcase',
		schema: ctaBannerSchema,
		source_code: ctaBannerSource,
		sample_data_key: 'ctaBanner'
	},
	{
		slug: 'instructor-grid',
		name: 'Instructor Grid',
		description: 'Team showcase grid with photos and details',
		schema: instructorGridSchema,
		source_code: instructorGridSource,
		sample_data_key: 'instructorGrid'
	},
	{
		slug: 'values-grid',
		name: 'Values Grid',
		description: 'Grid of value/feature cards',
		schema: valuesGridSchema,
		source_code: valuesGridSource,
		sample_data_key: 'valuesGrid'
	},
	{
		slug: 'story',
		name: 'Story Section',
		description: 'Long-form content with heading, subheading, and paragraphs',
		schema: storySchema,
		source_code: storySource,
		sample_data_key: 'story'
	},
	{
		slug: 'html',
		name: 'HTML Block',
		description: 'Raw HTML with optional CSS for custom content',
		schema: htmlSchema,
		source_code: htmlSource,
		sample_data_key: 'html'
	}
];

// ============================================
// SEED FUNCTION
// ============================================

export interface SeedResult {
	created: string[];
	skipped: string[];
	errors: { slug: string; error: string }[];
}

/**
 * Seed core section templates for a tenant
 * Skips templates that already exist
 */
export async function seedCoreTemplates(tenantId: string): Promise<SeedResult> {
	const result: SeedResult = {
		created: [],
		skipped: [],
		errors: []
	};

	// Get existing templates
	const existing = await getTenantTemplates(tenantId);
	const existingSlugs = new Set(existing.map((t) => t.slug));

	// Get sample data
	const sampleData = extractSampleData();

	// Create each template
	for (const def of templateDefinitions) {
		if (existingSlugs.has(def.slug)) {
			result.skipped.push(def.slug);
			continue;
		}

		try {
			await createTemplate({
				tenant_id: tenantId,
				slug: def.slug,
				name: def.name,
				description: def.description,
				category: 'section',
				source_code: def.source_code,
				schema: def.schema,
				sample_data: sampleData[def.sample_data_key] as Record<string, unknown>,
				updated_at: new Date()
			});
			result.created.push(def.slug);
		} catch (err) {
			result.errors.push({
				slug: def.slug,
				error: err instanceof Error ? err.message : String(err)
			});
		}
	}

	return result;
}

/** Core template slugs that should exist for a tenant */
const CORE_TEMPLATE_SLUGS = templateDefinitions.map((d) => d.slug);

/**
 * Check if all core templates exist for a tenant
 */
export async function hasCoreTemplates(tenantId: string): Promise<boolean> {
	const templates = await getTenantTemplates(tenantId);
	const existingSlugs = new Set(templates.map((t) => t.slug));

	// Check if ALL core templates exist
	return CORE_TEMPLATE_SLUGS.every((slug) => existingSlugs.has(slug));
}
