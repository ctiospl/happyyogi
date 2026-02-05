export const homePage = {
	slug: 'home',
	title: 'Happy Yogi Shaala',
	seo: {
		title: 'Happy Yogi Shaala | Yoga Studio in Mumbai Parel',
		description:
			'Traditional yoga meets modern lifestyle at Happy Yogi Shaala. Ashtanga, Hatha, corporate wellness & personal training in Mumbai.'
	},
	sections: [
		{
			id: 'hero',
			type: 'hero',
			headline: 'Find Your Balance in the Heart of Mumbai',
			subheadline:
				'Welcome to Happy Yogi Shaala — your urban oasis where ancient yoga traditions meet modern life. Breathe deeply, move mindfully, and discover the joy of practice.',
			cta: {
				text: 'Start Your Journey',
				href: '/contact'
			},
			secondaryCta: {
				text: 'View Workshops',
				href: '/workshops'
			},
			location: 'Sportsmed Mumbai, Parel West'
		},
		{
			id: 'services',
			type: 'services-grid',
			headline: 'Our Offerings',
			subheadline: 'Yoga for every body, every lifestyle',
			services: [
				{
					title: 'Online Yoga Classes',
					description:
						'Practice from anywhere with live-streamed sessions. Perfect for busy schedules and those who prefer the comfort of home.',
					icon: 'video',
					href: '/services/online'
				},
				{
					title: 'In-Person Ashtanga',
					description:
						'Traditional Mysore-style and led Ashtanga classes. Build strength, flexibility, and focus through this dynamic practice.',
					icon: 'users',
					href: '/services/ashtanga'
				},
				{
					title: 'Yoga for Sports',
					description:
						'Tailored programs for athletes. Enhance performance, prevent injuries, and accelerate recovery through targeted yoga.',
					icon: 'activity',
					href: '/services/sports'
				},
				{
					title: 'Personal Classes',
					description:
						'One-on-one attention for your unique goals. Whether healing, deepening practice, or starting fresh — we meet you where you are.',
					icon: 'user',
					href: '/services/personal'
				},
				{
					title: 'Corporate Wellness',
					description:
						'Bring wellness to your workplace. Stress reduction, team building, and productivity through customized corporate programs.',
					icon: 'briefcase',
					href: '/services/corporate'
				},
				{
					title: 'Workshops & Events',
					description:
						'Immersive experiences to deepen your understanding. From weekend intensives to special themed workshops.',
					icon: 'calendar',
					href: '/services/workshops'
				}
			]
		},
		{
			id: 'about',
			type: 'about-snippet',
			headline: 'The Happy Yogi Co.',
			content:
				"At Happy Yogi Shaala, we believe yoga is for everyone. Our space at Sportsmed Mumbai bridges the gap between ancient wisdom and contemporary wellness. Whether you're a seasoned practitioner or stepping onto the mat for the first time, you'll find a warm, supportive community ready to welcome you.",
			highlights: [
				'Traditional teachings, modern approach',
				'Expert guidance for all levels',
				'A welcoming community space'
			],
			cta: {
				text: 'Learn More About Us',
				href: '/about'
			}
		},
		{
			id: 'testimonials',
			type: 'testimonial-carousel',
			headline: 'What Our Students Say',
			testimonials: [
				{
					quote:
						'Happy Yogi Shaala has transformed not just my practice, but my entire approach to wellness. The teachers truly care about each student.',
					author: 'Priya M.',
					role: 'Student for 2 years'
				},
				{
					quote:
						"The corporate sessions have been a game-changer for our team's productivity and morale. Highly recommend for any organization.",
					author: 'Rahul S.',
					role: 'HR Director'
				},
				{
					quote:
						'As an athlete, the sports-focused yoga has helped me prevent injuries and recover faster. Essential part of my training now.',
					author: 'Anika T.',
					role: 'Marathon Runner'
				}
			]
		},
		{
			id: 'cta-banner',
			type: 'cta-banner',
			headline: 'Ready to Begin?',
			subheadline:
				'Your first class is always welcoming. Join us at Sportsmed Mumbai, Parel West, and experience the Happy Yogi difference.',
			cta: {
				text: 'Book Your First Class',
				href: '/contact'
			},
			secondaryCta: {
				text: 'View Workshops',
				href: '/workshops'
			}
		}
	]
} as const;

export type HomePage = typeof homePage;
export type HomeSection = (typeof homePage.sections)[number];
