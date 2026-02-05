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

// Font families matching the site's theme
const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'DM Sans', sans-serif";

// Helper to generate placeholder HTML for editor preview
function heroPlaceholder(props: typeof defaultHero) {
	// Match actual component: gradient from-background/95 via-background/70 to-background/30 (left to right)
	return `
		<div style="position: relative; min-height: 500px; overflow: hidden; font-family: ${FONT_BODY};">
			${props.backgroundImage ? `
				<div style="position: absolute; inset: 0;">
					<img src="${props.backgroundImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="" />
					<div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(255,253,247,0.95) 0%, rgba(255,253,247,0.7) 40%, rgba(255,253,247,0.3) 100%);"></div>
				</div>
			` : `
				<div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(255,253,247,0.95), rgba(255,253,247,0.7), rgba(255,253,247,0.3));"></div>
			`}
			<div style="position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; padding: 80px 24px; min-height: 500px; display: flex; align-items: center;">
				<div style="max-width: 600px;">
					<h1 style="font-family: ${FONT_DISPLAY}; font-size: 48px; font-weight: 700; margin-bottom: 24px; color: #1a1a1a; line-height: 1.1; letter-spacing: -0.02em;">${props.headline}</h1>
					${props.subheadline ? `<p style="font-size: 18px; color: #666; margin-bottom: 32px; line-height: 1.7;">${props.subheadline}</p>` : ''}
					<div style="display: flex; gap: 16px; flex-wrap: wrap;">
						${props.cta ? `<span style="padding: 14px 28px; background: #5a7a5a; color: white; border-radius: 8px; font-weight: 600; font-size: 16px;">${props.cta.text}</span>` : ''}
						${props.secondaryCta ? `<span style="padding: 14px 28px; border: 2px solid #1a1a1a; color: #1a1a1a; border-radius: 8px; font-weight: 600; font-size: 16px;">${props.secondaryCta.text}</span>` : ''}
					</div>
					${props.location ? `<p style="margin-top: 32px; font-size: 14px; color: #666; display: flex; align-items: center; gap: 8px;"><span style="color: #5a7a5a;">📍</span> ${props.location}</p>` : ''}
				</div>
			</div>
		</div>
	`;
}

function servicesPlaceholder(props: typeof defaultServicesGrid) {
	const hasImage = props.featureImage;
	// Match actual component: cards on LEFT, image on RIGHT with gradient blur background
	return `
		<div style="padding: 80px 20px; background: #fffdf7; font-family: ${FONT_BODY};">
			<div style="max-width: 1200px; margin: 0 auto;">
				<div style="text-align: center; margin-bottom: 48px;">
					<h2 style="font-family: ${FONT_DISPLAY}; font-size: 36px; font-weight: 700; margin-bottom: 12px; color: #1a1a1a; letter-spacing: -0.02em;">${props.headline}</h2>
					<p style="color: #666; font-size: 18px;">${props.subheadline || ''}</p>
				</div>
				<div style="display: grid; grid-template-columns: ${hasImage ? '1fr 1fr' : '1fr'}; gap: 48px; align-items: start;">
					<!-- Cards on LEFT -->
					<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
						${props.services.map(s => `
							<div style="padding: 24px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #f0f0f0;">
								<div style="width: 48px; height: 48px; background: rgba(90,122,90,0.1); border-radius: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
									<span style="color: #5a7a5a; font-size: 20px;">●</span>
								</div>
								<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a;">${s.title}</h3>
								<p style="font-size: 14px; color: #666; line-height: 1.5;">${s.description}</p>
							</div>
						`).join('')}
					</div>
					<!-- Image on RIGHT with gradient blur -->
					${hasImage ? `
						<div style="position: relative;">
							<div style="position: absolute; inset: -16px; background: linear-gradient(135deg, rgba(184,134,11,0.2), rgba(200,180,150,0.2)); border-radius: 24px; filter: blur(24px);"></div>
							<img src="${props.featureImage}" style="position: relative; width: 100%; height: auto; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);" alt="Feature" />
						</div>
					` : ''}
				</div>
			</div>
		</div>
	`;
}

function aboutPlaceholder(props: typeof defaultAboutSnippet) {
	const hasImage = props.image;
	// Match actual component: image on LEFT with blur gradient, content on RIGHT
	// @ts-ignore - stats may exist on props from database
	const stats = (props as { stats?: { value: string; label: string }[] }).stats;
	return `
		<div style="padding: 80px 20px; background: rgba(249,247,243,0.3); font-family: ${FONT_BODY};">
			<div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: ${hasImage ? '1fr 1fr' : '1fr'}; gap: 48px; align-items: center;">
				<!-- Image on LEFT with gradient blur -->
				${hasImage ? `
					<div style="position: relative;">
						<div style="position: absolute; inset: -16px; background: linear-gradient(135deg, rgba(200,180,150,0.3), rgba(184,134,11,0.3)); border-radius: 24px; filter: blur(24px);"></div>
						<div style="position: relative; overflow: hidden; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
							<img src="${props.image}" style="width: 100%; display: block;" alt="About" />
						</div>
						${stats && stats.length > 0 ? `
							<div style="position: absolute; bottom: -24px; right: -24px; background: white; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px;">
								<div style="width: 48px; height: 48px; background: rgba(90,122,90,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
									<span style="color: #5a7a5a; font-size: 20px;">👥</span>
								</div>
								<div>
									<p style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">${stats[0].value}</p>
									<p style="font-size: 13px; color: #666; margin: 0;">${stats[0].label}</p>
								</div>
							</div>
						` : ''}
					</div>
				` : ''}
				<!-- Content on RIGHT -->
				<div>
					<h2 style="font-size: 36px; font-weight: 700; margin-bottom: 24px; color: #1a1a1a;">${props.headline}</h2>
					<p style="color: #666; margin-bottom: 32px; line-height: 1.7; font-size: 17px;">${props.content}</p>
					${props.highlights ? `
						<ul style="list-style: none; padding: 0; margin-bottom: 32px;">
							${props.highlights.map(h => `
								<li style="padding: 10px 0; color: #1a1a1a; display: flex; align-items: center; gap: 12px;">
									<span style="width: 24px; height: 24px; background: rgba(90,122,90,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
										<span style="color: #5a7a5a; font-size: 12px;">✓</span>
									</span>
									${h}
								</li>
							`).join('')}
						</ul>
					` : ''}
					${props.cta ? `<span style="display: inline-block; padding: 14px 28px; border: 2px solid #1a1a1a; color: #1a1a1a; border-radius: 8px; font-weight: 600;">${props.cta.text}</span>` : ''}
				</div>
			</div>
		</div>
	`;
}

function testimonialsPlaceholder(props: typeof defaultTestimonials) {
	return `
		<div style="padding: 80px 20px; background: #fff;">
			<div style="max-width: 1100px; margin: 0 auto; text-align: center;">
				<h2 style="font-size: 32px; font-weight: bold; margin-bottom: 48px;">${props.headline}</h2>
				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
					${props.testimonials.map(t => `
						<div style="padding: 32px; background: #f9f9f9; border-radius: 12px; text-align: left; position: relative;">
							<div style="font-size: 48px; color: #5a7a5a; opacity: 0.3; position: absolute; top: 16px; left: 24px;">"</div>
							<p style="font-style: italic; color: #444; margin-bottom: 20px; line-height: 1.7; font-size: 16px; padding-top: 24px;">${t.quote}</p>
							<div style="border-top: 1px solid #e0e0e0; padding-top: 16px;">
								<p style="font-weight: 600; margin-bottom: 2px;">${t.author}</p>
								<p style="font-size: 14px; color: #5a7a5a;">${t.role}</p>
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
		: `background: linear-gradient(135deg, #5a7a5a 0%, #d4a017 100%);`;
	return `
		<div style="padding: 100px 20px; ${bgStyle} text-align: center;">
			<div style="max-width: 700px; margin: 0 auto;">
				<h2 style="font-size: 36px; font-weight: bold; color: white; margin-bottom: 16px;">${props.headline}</h2>
				<p style="color: rgba(255,255,255,0.9); margin-bottom: 32px; font-size: 18px; line-height: 1.6;">${props.subheadline || ''}</p>
				${props.cta ? `<span style="display: inline-block; padding: 16px 32px; background: #5a7a5a; color: white; border-radius: 6px; font-weight: 600; font-size: 16px;">${props.cta.text}</span>` : ''}
			</div>
		</div>
	`;
}

function instructorsPlaceholder(props: typeof defaultInstructorGrid) {
	const instructors = props.instructors || [];
	return `
		<div style="padding: 80px 20px; background: #f9f9f9;">
			<div style="max-width: 1000px; margin: 0 auto; text-align: center;">
				<h2 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">${props.heading}</h2>
				<p style="color: #666; margin-bottom: 48px; font-size: 18px;">${props.subheading || ''}</p>
				<div style="display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;">
					${instructors.length > 0 ? instructors.map(i => `
						<div style="width: 200px; text-align: center;">
							<img src="${i.image}" style="width: 160px; height: 160px; object-fit: cover; border-radius: 50%; margin: 0 auto 16px; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="${i.name}" />
							<p style="font-weight: 600; font-size: 18px; margin-bottom: 4px;">${i.name}</p>
							<p style="font-size: 14px; color: #5a7a5a;">${i.specialty || i.role || ''}</p>
						</div>
					`).join('') : `
						<p style="color: #999;">(No instructors configured)</p>
					`}
				</div>
			</div>
		</div>
	`;
}

function valuesPlaceholder(props: typeof defaultValuesGrid) {
	return `
		<div style="padding: 60px 20px; background: #fff;">
			<div style="max-width: 1000px; margin: 0 auto; text-align: center;">
				<h2 style="font-size: 28px; font-weight: bold; margin-bottom: 32px;">${props.heading}</h2>
				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
					${props.values.map(v => `
						<div style="padding: 24px; text-align: center;">
							<div style="width: 48px; height: 48px; background: #5a7a5a20; border-radius: 8px; margin: 0 auto 12px;"></div>
							<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${v.title}</h3>
							<p style="font-size: 14px; color: #666;">${v.description}</p>
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
		<div style="padding: 80px 20px; background: #f9f9f9;">
			<div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: ${hasImage ? '1fr 1fr' : '1fr'}; gap: 60px; align-items: center;">
				<div>
					<h2 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">${props.heading}</h2>
					<p style="color: #5a7a5a; margin-bottom: 28px; font-size: 18px;">${props.subheading || ''}</p>
					${props.content.map(p => `<p style="color: #666; margin-bottom: 16px; line-height: 1.7; font-size: 16px;">${p}</p>`).join('')}
				</div>
				${hasImage ? `<div><img src="${props.image}" style="width: 100%; height: 400px; object-fit: cover; border-radius: 12px;" alt="Story" /></div>` : ''}
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
