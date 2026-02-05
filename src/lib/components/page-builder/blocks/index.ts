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
				'data-props': defaultHero,
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline' },
					{ type: 'text', name: 'subheadline', label: 'Subheadline' },
					{ type: 'text', name: 'location', label: 'Location' },
					{ type: 'text', name: 'backgroundImage', label: 'Background Image URL' },
					{ type: 'text', name: 'ctaText', label: 'CTA Button Text' },
					{ type: 'text', name: 'ctaHref', label: 'CTA Button Link' },
					{ type: 'text', name: 'secondaryCtaText', label: 'Secondary CTA Text' },
					{ type: 'text', name: 'secondaryCtaHref', label: 'Secondary CTA Link' }
				]
			},
			init() {
				this.on('change:attributes', this.updateProps);
			},
			updateProps() {
				const attrs = this.getAttributes();
				const props = this.get('data-props') || { ...defaultHero };
				if (attrs.headline) props.headline = attrs.headline;
				if (attrs.subheadline) props.subheadline = attrs.subheadline;
				if (attrs.location) props.location = attrs.location;
				if (attrs.backgroundImage) props.backgroundImage = attrs.backgroundImage;
				if (attrs.ctaText || attrs.ctaHref) {
					props.cta = { text: attrs.ctaText || 'Get Started', href: attrs.ctaHref || '/contact' };
				}
				if (attrs.secondaryCtaText || attrs.secondaryCtaHref) {
					props.secondaryCta = { text: attrs.secondaryCtaText || 'Learn More', href: attrs.secondaryCtaHref || '/about-us' };
				}
				this.set('data-props', props);
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
				'data-props': defaultServicesGrid,
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline' },
					{ type: 'text', name: 'subheadline', label: 'Subheadline' },
					{ type: 'text', name: 'featureImage', label: 'Feature Image URL' }
				]
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
				'data-props': defaultAboutSnippet,
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline' },
					{ type: 'textarea', name: 'content', label: 'Content' },
					{ type: 'text', name: 'image', label: 'Image URL' },
					{ type: 'text', name: 'ctaText', label: 'CTA Text' },
					{ type: 'text', name: 'ctaHref', label: 'CTA Link' }
				]
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
				'data-props': defaultTestimonials,
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline' }
				]
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
				'data-props': defaultCtaBanner,
				traits: [
					{ type: 'text', name: 'headline', label: 'Headline' },
					{ type: 'text', name: 'subheadline', label: 'Subheadline' },
					{ type: 'text', name: 'backgroundImage', label: 'Background Image URL' },
					{ type: 'text', name: 'ctaText', label: 'CTA Text' },
					{ type: 'text', name: 'ctaHref', label: 'CTA Link' },
					{ type: 'checkbox', name: 'showInstructors', label: 'Show Instructors' }
				]
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
				'data-props': defaultInstructorGrid,
				traits: [
					{ type: 'text', name: 'heading', label: 'Heading' },
					{ type: 'text', name: 'subheading', label: 'Subheading' }
				]
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
				'data-props': defaultValuesGrid,
				traits: [
					{ type: 'text', name: 'heading', label: 'Heading' }
				]
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
				'data-props': defaultStory,
				traits: [
					{ type: 'text', name: 'heading', label: 'Heading' },
					{ type: 'text', name: 'subheading', label: 'Subheading' },
					{ type: 'text', name: 'image', label: 'Image URL' }
				]
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
