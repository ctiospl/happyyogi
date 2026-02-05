/**
 * GrapesJS custom component types for structured content blocks
 */
import type { Editor } from 'grapesjs';
import type { HeroBlock, ServicesGridBlock, AboutSnippetBlock, TestimonialCarouselBlock, CtaBannerBlock, InstructorGridBlock, ValuesGridBlock, StoryBlock } from '$lib/types';

// Default block data
const defaultHero: Omit<HeroBlock, 'type'> = {
	headline: 'Welcome to Happy Yogi',
	subheadline: 'Your journey to wellness begins here',
	cta: { text: 'Get Started', href: '/contact' },
	secondaryCta: { text: 'Learn More', href: '/about-us' },
	location: 'Mumbai, India'
};

const defaultServicesGrid: Omit<ServicesGridBlock, 'type'> = {
	headline: 'Our Services',
	subheadline: 'Explore what we offer',
	services: [
		{ title: 'Service 1', description: 'Description here', icon: 'activity' },
		{ title: 'Service 2', description: 'Description here', icon: 'users' }
	]
};

const defaultAboutSnippet: Omit<AboutSnippetBlock, 'type'> = {
	headline: 'About Us',
	content: 'Tell your story here...',
	highlights: ['Point one', 'Point two', 'Point three'],
	cta: { text: 'Learn More', href: '/about-us' }
};

const defaultTestimonials: Omit<TestimonialCarouselBlock, 'type'> = {
	headline: 'What Our Clients Say',
	testimonials: [
		{ quote: 'Amazing experience!', author: 'John D.', role: 'Client' },
		{ quote: 'Highly recommended', author: 'Jane S.', role: 'Member' }
	]
};

const defaultCtaBanner: Omit<CtaBannerBlock, 'type'> = {
	headline: 'Ready to Begin?',
	subheadline: 'Start your journey today',
	cta: { text: 'Contact Us', href: '/contact' },
	showInstructors: false
};

const defaultInstructorGrid: Omit<InstructorGridBlock, 'type'> = {
	heading: 'Meet Our Team',
	subheading: 'Expert instructors dedicated to your growth',
	instructors: []
};

const defaultValuesGrid: Omit<ValuesGridBlock, 'type'> = {
	heading: 'Our Values',
	values: [
		{ title: 'Value 1', description: 'Description' },
		{ title: 'Value 2', description: 'Description' }
	]
};

const defaultStory: Omit<StoryBlock, 'type'> = {
	heading: 'Our Story',
	subheading: 'How it all began',
	content: ['First paragraph...', 'Second paragraph...']
};

// Helper to generate placeholder HTML for editor preview
// Uses CSS classes that match the injected site CSS for 1:1 visual matching
function heroPlaceholder(props: typeof defaultHero) {
	return `
		<div class="relative min-h-[500px] overflow-hidden">
			${props.backgroundImage ? `
				<div class="absolute inset-0">
					<img src="${props.backgroundImage}" class="w-full h-full object-cover" alt="" />
					<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
				</div>
			` : `
				<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
			`}
			<div class="relative z-10 container mx-auto px-6 py-20 min-h-[500px] flex items-center">
				<div class="max-w-2xl">
					<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">${props.headline}</h1>
					${props.subheadline ? `<p class="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">${props.subheadline}</p>` : ''}
					<div class="flex flex-wrap gap-4">
						${props.cta ? `<span class="btn btn-primary btn-lg">${props.cta.text}</span>` : ''}
						${props.secondaryCta ? `<span class="btn btn-outline btn-lg">${props.secondaryCta.text}</span>` : ''}
					</div>
					${props.location ? `<p class="mt-8 text-sm text-muted-foreground flex items-center gap-2"><span class="text-primary">📍</span> ${props.location}</p>` : ''}
				</div>
			</div>
		</div>
	`;
}

function servicesPlaceholder(props: typeof defaultServicesGrid) {
	const hasImage = props.featureImage;
	return `
		<div class="py-20 px-4 bg-background">
			<div class="container mx-auto">
				<div class="text-center mb-12">
					<h2 class="text-3xl font-bold tracking-tight text-foreground mb-4">${props.headline}</h2>
					<p class="text-lg text-muted-foreground">${props.subheadline || ''}</p>
				</div>
				<div class="grid ${hasImage ? 'grid-cols-2' : 'grid-cols-1'} gap-12 items-start">
					<div class="grid grid-cols-2 gap-4">
						${props.services.map(s => `
							<div class="card p-6">
								<div class="icon-placeholder mb-4">
									<span class="text-primary">●</span>
								</div>
								<h3 class="font-semibold text-foreground mb-2">${s.title}</h3>
								<p class="text-sm text-muted-foreground leading-relaxed">${s.description}</p>
							</div>
						`).join('')}
					</div>
					${hasImage ? `
						<div class="relative">
							<div style="position: absolute; inset: -16px; background: linear-gradient(135deg, var(--accent) / 20%, var(--brand-sand) / 20%); border-radius: 24px; filter: blur(24px);"></div>
							<img src="${props.featureImage}" class="relative w-full rounded-2xl shadow-lg" alt="Feature" />
						</div>
					` : ''}
				</div>
			</div>
		</div>
	`;
}

function aboutPlaceholder(props: typeof defaultAboutSnippet) {
	const hasImage = props.image;
	// @ts-ignore - stats may exist on props from database
	const stats = (props as { stats?: { value: string; label: string }[] }).stats;
	return `
		<div class="py-20 px-4 bg-secondary/30">
			<div class="max-w-4xl mx-auto grid ${hasImage ? 'grid-cols-2' : 'grid-cols-1'} gap-12 items-center">
				${hasImage ? `
					<div class="relative">
						<div style="position: absolute; inset: -16px; background: linear-gradient(135deg, var(--brand-sand) / 30%, var(--accent) / 30%); border-radius: 24px; filter: blur(24px);"></div>
						<div class="relative overflow-hidden rounded-2xl shadow-lg">
							<img src="${props.image}" class="w-full block" alt="About" />
						</div>
						${stats && stats.length > 0 ? `
							<div class="stats-badge">
								<div class="icon-placeholder rounded-full">
									<span class="text-primary">👥</span>
								</div>
								<div>
									<p class="text-2xl font-bold text-foreground">${stats[0].value}</p>
									<p class="text-sm text-muted-foreground">${stats[0].label}</p>
								</div>
							</div>
						` : ''}
					</div>
				` : ''}
				<div>
					<h2 class="text-3xl font-bold text-foreground mb-6">${props.headline}</h2>
					<p class="text-muted-foreground mb-8 leading-relaxed text-lg">${props.content}</p>
					${props.highlights ? `
						<ul class="mb-8" style="list-style: none; padding: 0;">
							${props.highlights.map(h => `
								<li class="py-2 text-foreground flex items-center gap-3">
									<span class="icon-placeholder rounded-full" style="width: 24px; height: 24px;">
										<span class="text-primary text-sm">✓</span>
									</span>
									${h}
								</li>
							`).join('')}
						</ul>
					` : ''}
					${props.cta ? `<span class="btn btn-outline">${props.cta.text}</span>` : ''}
				</div>
			</div>
		</div>
	`;
}

function testimonialsPlaceholder(props: typeof defaultTestimonials) {
	return `
		<div class="py-20 px-4 bg-card">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-3xl font-bold text-foreground mb-12">${props.headline}</h2>
				<div class="grid md:grid-cols-2 gap-8">
					${props.testimonials.map(t => `
						<div class="card p-8 text-left relative">
							<div class="absolute top-4 left-6 text-5xl text-primary opacity-30">"</div>
							<p class="text-muted-foreground leading-relaxed mb-6 pt-6">${t.quote}</p>
							<div class="border-t pt-4">
								<p class="font-semibold text-foreground mb-1">${t.author}</p>
								<p class="text-sm text-primary">${t.role}</p>
							</div>
						</div>
					`).join('')}
				</div>
			</div>
		</div>
	`;
}

function ctaPlaceholder(props: typeof defaultCtaBanner) {
	const bgStyle = props.backgroundImage
		? `background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${props.backgroundImage}') center/cover;`
		: `background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);`;
	return `
		<div class="py-24 px-4 text-center" style="${bgStyle}">
			<div class="max-w-3xl mx-auto">
				<h2 class="text-3xl font-bold mb-4" style="color: white;">${props.headline}</h2>
				<p class="text-lg mb-8 leading-relaxed" style="color: rgba(255,255,255,0.9);">${props.subheadline || ''}</p>
				${props.cta ? `<span class="btn btn-primary btn-lg">${props.cta.text}</span>` : ''}
			</div>
		</div>
	`;
}

function instructorsPlaceholder(props: typeof defaultInstructorGrid) {
	const instructors = props.instructors || [];
	return `
		<div class="py-20 px-4 bg-muted">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-3xl font-bold text-foreground mb-2">${props.heading}</h2>
				<p class="text-lg text-muted-foreground mb-12">${props.subheading || ''}</p>
				<div class="flex gap-12 justify-center flex-wrap">
					${instructors.length > 0 ? instructors.map(i => `
						<div style="width: 200px;" class="text-center">
							<img src="${i.image}" class="w-40 h-40 object-cover rounded-full mx-auto mb-4 border-4 shadow-md" style="border-color: white;" alt="${i.name}" />
							<p class="font-semibold text-lg text-foreground mb-1">${i.name}</p>
							<p class="text-sm text-primary">${i.specialty || i.role || ''}</p>
						</div>
					`).join('') : `
						<p class="text-muted-foreground">(No instructors configured)</p>
					`}
				</div>
			</div>
		</div>
	`;
}

function valuesPlaceholder(props: typeof defaultValuesGrid) {
	return `
		<div class="py-16 px-4 bg-card">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-3xl font-bold text-foreground mb-8">${props.heading}</h2>
				<div class="grid md:grid-cols-3 gap-6">
					${props.values.map(v => `
						<div class="p-6 text-center">
							<div class="icon-placeholder mx-auto mb-4"></div>
							<h3 class="font-semibold text-foreground mb-2">${v.title}</h3>
							<p class="text-sm text-muted-foreground">${v.description}</p>
						</div>
					`).join('')}
				</div>
			</div>
		</div>
	`;
}

function storyPlaceholder(props: typeof defaultStory) {
	const hasImage = props.image;
	return `
		<div class="py-20 px-4 bg-muted">
			<div class="max-w-4xl mx-auto grid ${hasImage ? 'grid-cols-2' : 'grid-cols-1'} gap-16 items-center">
				<div>
					<h2 class="text-3xl font-bold text-foreground mb-2">${props.heading}</h2>
					<p class="text-lg text-primary mb-8">${props.subheading || ''}</p>
					${props.content.map(p => `<p class="text-muted-foreground mb-4 leading-relaxed">${p}</p>`).join('')}
				</div>
				${hasImage ? `<div><img src="${props.image}" class="w-full h-96 object-cover rounded-xl" alt="Story" /></div>` : ''}
			</div>
		</div>
	`;
}

/**
 * Register custom component types for structured content blocks
 */
export function registerCustomBlocks(editor: Editor) {
	const domc = editor.DomComponents;
	const bm = editor.BlockManager;

	// Hero Section Component
	domc.addType('hero-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'hero' },
				'data-props': { ...defaultHero },
				components: heroPlaceholder(defaultHero),
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline', changeProp: true },
					{ type: 'text', name: 'subheadline', label: 'Subheadline', changeProp: true },
					{ type: 'text', name: 'location', label: 'Location', changeProp: true },
					{ type: 'text', name: 'backgroundImage', label: 'Background Image URL', changeProp: true },
					{ type: 'text', name: 'ctaText', label: 'CTA Button Text', changeProp: true },
					{ type: 'text', name: 'ctaHref', label: 'CTA Button Link', changeProp: true },
					{ type: 'text', name: 'secondaryCtaText', label: 'Secondary CTA Text', changeProp: true },
					{ type: 'text', name: 'secondaryCtaHref', label: 'Secondary CTA Link', changeProp: true }
				],
				// Initialize trait values from defaults
				headline: defaultHero.headline,
				subheadline: defaultHero.subheadline,
				location: defaultHero.location,
				ctaText: defaultHero.cta?.text,
				ctaHref: defaultHero.cta?.href,
				secondaryCtaText: defaultHero.secondaryCta?.text,
				secondaryCtaHref: defaultHero.secondaryCta?.href
			},
			init() {
				this.on('change:headline change:subheadline change:location change:ctaText change:ctaHref change:secondaryCtaText change:secondaryCtaHref change:backgroundImage', this.updateContent);
				// Render with actual values on init
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const props = {
					headline: this.get('headline') || defaultHero.headline,
					subheadline: this.get('subheadline') || defaultHero.subheadline,
					location: this.get('location'),
					backgroundImage: this.get('backgroundImage'),
					cta: { text: this.get('ctaText') || 'Get Started', href: this.get('ctaHref') || '/contact' },
					secondaryCta: { text: this.get('secondaryCtaText') || 'Learn More', href: this.get('secondaryCtaHref') || '/about-us' }
				};
				this.set('data-props', props);
				this.components(heroPlaceholder(props));
			}
		}
	});

	// Services Grid Component
	domc.addType('services-grid-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'services-grid' },
				'data-props': { ...defaultServicesGrid },
				components: servicesPlaceholder(defaultServicesGrid),
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline', changeProp: true },
					{ type: 'text', name: 'subheadline', label: 'Subheadline', changeProp: true },
					{ type: 'text', name: 'featureImage', label: 'Feature Image URL', changeProp: true }
				],
				headline: defaultServicesGrid.headline,
				subheadline: defaultServicesGrid.subheadline
			},
			init() {
				this.on('change:headline change:subheadline', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const currentProps = this.get('data-props') || defaultServicesGrid;
				const props = {
					...currentProps,
					headline: this.get('headline') || defaultServicesGrid.headline,
					subheadline: this.get('subheadline') || defaultServicesGrid.subheadline,
					featureImage: this.get('featureImage')
				};
				this.set('data-props', props);
				this.components(servicesPlaceholder(props));
			}
		}
	});

	// About Snippet Component
	domc.addType('about-snippet-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'about-snippet' },
				'data-props': { ...defaultAboutSnippet },
				components: aboutPlaceholder(defaultAboutSnippet),
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline', changeProp: true },
					{ type: 'textarea', name: 'content', label: 'Content', changeProp: true },
					{ type: 'text', name: 'image', label: 'Image URL', changeProp: true },
					{ type: 'text', name: 'ctaText', label: 'CTA Text', changeProp: true },
					{ type: 'text', name: 'ctaHref', label: 'CTA Link', changeProp: true }
				],
				headline: defaultAboutSnippet.headline,
				content: defaultAboutSnippet.content,
				ctaText: defaultAboutSnippet.cta?.text,
				ctaHref: defaultAboutSnippet.cta?.href
			},
			init() {
				this.on('change:headline change:content change:ctaText change:ctaHref change:image', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const currentProps = this.get('data-props') || defaultAboutSnippet;
				const props = {
					...currentProps,
					headline: this.get('headline') || defaultAboutSnippet.headline,
					content: this.get('content') || defaultAboutSnippet.content,
					image: this.get('image'),
					cta: { text: this.get('ctaText') || 'Learn More', href: this.get('ctaHref') || '/about-us' }
				};
				this.set('data-props', props);
				this.components(aboutPlaceholder(props));
			}
		}
	});

	// Testimonial Carousel Component
	domc.addType('testimonial-carousel-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'testimonial-carousel' },
				'data-props': { ...defaultTestimonials },
				components: testimonialsPlaceholder(defaultTestimonials),
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline', changeProp: true }
				],
				headline: defaultTestimonials.headline
			},
			init() {
				this.on('change:headline', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const currentProps = this.get('data-props') || defaultTestimonials;
				const props = {
					...currentProps,
					headline: this.get('headline') || defaultTestimonials.headline
				};
				this.set('data-props', props);
				this.components(testimonialsPlaceholder(props));
			}
		}
	});

	// CTA Banner Component
	domc.addType('cta-banner-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'cta-banner' },
				'data-props': { ...defaultCtaBanner },
				components: ctaPlaceholder(defaultCtaBanner),
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline', changeProp: true },
					{ type: 'text', name: 'subheadline', label: 'Subheadline', changeProp: true },
					{ type: 'text', name: 'backgroundImage', label: 'Background Image URL', changeProp: true },
					{ type: 'text', name: 'ctaText', label: 'CTA Text', changeProp: true },
					{ type: 'text', name: 'ctaHref', label: 'CTA Link', changeProp: true },
					{ type: 'checkbox', name: 'showInstructors', label: 'Show Instructors', changeProp: true }
				],
				headline: defaultCtaBanner.headline,
				subheadline: defaultCtaBanner.subheadline,
				ctaText: defaultCtaBanner.cta?.text,
				ctaHref: defaultCtaBanner.cta?.href,
				showInstructors: defaultCtaBanner.showInstructors
			},
			init() {
				this.on('change:headline change:subheadline change:ctaText change:ctaHref change:backgroundImage change:showInstructors', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const props = {
					headline: this.get('headline') || defaultCtaBanner.headline,
					subheadline: this.get('subheadline') || defaultCtaBanner.subheadline,
					backgroundImage: this.get('backgroundImage'),
					cta: { text: this.get('ctaText') || 'Contact Us', href: this.get('ctaHref') || '/contact' },
					showInstructors: this.get('showInstructors') || false
				};
				this.set('data-props', props);
				this.components(ctaPlaceholder(props));
			}
		}
	});

	// Instructor Grid Component
	domc.addType('instructor-grid-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'instructor-grid' },
				'data-props': { ...defaultInstructorGrid },
				components: instructorsPlaceholder(defaultInstructorGrid),
				traits: [
					{ type: 'text', name: 'heading', label: 'Heading', changeProp: true },
					{ type: 'text', name: 'subheading', label: 'Subheading', changeProp: true }
				],
				heading: defaultInstructorGrid.heading,
				subheading: defaultInstructorGrid.subheading
			},
			init() {
				this.on('change:heading change:subheading', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const currentProps = this.get('data-props') || defaultInstructorGrid;
				const props = {
					...currentProps,
					heading: this.get('heading') || defaultInstructorGrid.heading,
					subheading: this.get('subheading') || defaultInstructorGrid.subheading
				};
				this.set('data-props', props);
				this.components(instructorsPlaceholder(props));
			}
		}
	});

	// Values Grid Component
	domc.addType('values-grid-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'values-grid' },
				'data-props': { ...defaultValuesGrid },
				components: valuesPlaceholder(defaultValuesGrid),
				traits: [
					{ type: 'text', name: 'heading', label: 'Heading', changeProp: true }
				],
				heading: defaultValuesGrid.heading
			},
			init() {
				this.on('change:heading', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const currentProps = this.get('data-props') || defaultValuesGrid;
				const props = {
					...currentProps,
					heading: this.get('heading') || defaultValuesGrid.heading
				};
				this.set('data-props', props);
				this.components(valuesPlaceholder(props));
			}
		}
	});

	// Story Component
	domc.addType('story-section', {
		model: {
			defaults: {
				tagName: 'section',
				draggable: true,
				droppable: false,
				attributes: { 'data-block-type': 'story' },
				'data-props': { ...defaultStory },
				components: storyPlaceholder(defaultStory),
				traits: [
					{ type: 'text', name: 'heading', label: 'Heading', changeProp: true },
					{ type: 'text', name: 'subheading', label: 'Subheading', changeProp: true },
					{ type: 'text', name: 'image', label: 'Image URL', changeProp: true }
				],
				heading: defaultStory.heading,
				subheading: defaultStory.subheading
			},
			init() {
				this.on('change:heading change:subheading change:image', this.updateContent);
				setTimeout(() => this.updateContent(), 0);
			},
			updateContent() {
				const currentProps = this.get('data-props') || defaultStory;
				const props = {
					...currentProps,
					heading: this.get('heading') || defaultStory.heading,
					subheading: this.get('subheading') || defaultStory.subheading,
					image: this.get('image')
				};
				this.set('data-props', props);
				this.components(storyPlaceholder(props));
			}
		}
	});

	// Register blocks in the block manager
	bm.add('structured-hero', {
		label: 'Hero Section (Structured)',
		category: 'Structured Sections',
		content: { type: 'hero-section' }
	});

	bm.add('structured-services-grid', {
		label: 'Services Grid (Structured)',
		category: 'Structured Sections',
		content: { type: 'services-grid-section' }
	});

	bm.add('structured-about', {
		label: 'About Section (Structured)',
		category: 'Structured Sections',
		content: { type: 'about-snippet-section' }
	});

	bm.add('structured-testimonials', {
		label: 'Testimonials (Structured)',
		category: 'Structured Sections',
		content: { type: 'testimonial-carousel-section' }
	});

	bm.add('structured-cta', {
		label: 'CTA Banner (Structured)',
		category: 'Structured Sections',
		content: { type: 'cta-banner-section' }
	});

	bm.add('structured-instructors', {
		label: 'Instructor Grid (Structured)',
		category: 'Structured Sections',
		content: { type: 'instructor-grid-section' }
	});

	bm.add('structured-values', {
		label: 'Values Grid (Structured)',
		category: 'Structured Sections',
		content: { type: 'values-grid-section' }
	});

	bm.add('structured-story', {
		label: 'Story Section (Structured)',
		category: 'Structured Sections',
		content: { type: 'story-section' }
	});
}

export { defaultHero, defaultServicesGrid, defaultAboutSnippet, defaultTestimonials, defaultCtaBanner, defaultInstructorGrid, defaultValuesGrid, defaultStory };
