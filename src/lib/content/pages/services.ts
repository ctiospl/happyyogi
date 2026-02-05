/**
 * Services/Classes page content for Happy Yogi Shaala
 * Structure designed to populate database pages.content_json
 */

export interface ServiceItem {
	id: string;
	title: string;
	description: string;
	icon: string;
	schedule?: string;
	location?: string;
	highlight?: string;
}

export interface ServicesPageContent {
	slug: string;
	title: string;
	seo: {
		title: string;
		description: string;
		ogImage?: string;
	};
	sections: {
		hero: {
			headline: string;
			tagline: string;
			backgroundImage?: string;
		};
		services: ServiceItem[];
		schedule: {
			title: string;
			items: Array<{
				day: string;
				time: string;
				class: string;
				location: string;
			}>;
		};
		cta: {
			title: string;
			description: string;
			primaryButton: { label: string; href: string };
			secondaryButton?: { label: string; href: string };
		};
	};
}

export const servicesPage: ServicesPageContent = {
	slug: 'services',
	title: 'Our Services',
	seo: {
		title: 'Yoga Classes & Services | Happy Yogi Shaala',
		description:
			'Online yoga, Ashtanga classes, corporate wellness, personal training, workshops & retreats. Join Happy Yogi Shaala for transformative yoga experiences.',
		ogImage: '/images/services-og.jpg'
	},
	sections: {
		hero: {
			headline: 'Our Services',
			tagline: 'Transform your practice with classes designed for every level and lifestyle'
		},
		services: [
			{
				id: 'online-yoga',
				title: 'Online Yoga',
				description:
					'Join live classes from anywhere in the world. Perfect for busy schedules and those who prefer practicing from home.',
				icon: 'video',
				schedule: 'Mon/Wed/Fri 7-8am IST',
				location: 'Zoom',
				highlight: 'Accessible from anywhere'
			},
			{
				id: 'ashtanga',
				title: 'In-person Ashtanga',
				description:
					'Traditional Ashtanga Vinyasa practice with hands-on adjustments and personalized guidance in a dedicated studio setting.',
				icon: 'users',
				schedule: 'Tue/Thu 6:30-7:30am',
				location: 'Sportsmed Mumbai',
				highlight: 'Traditional Mysore-style'
			},
			{
				id: 'yoga-sports',
				title: 'Yoga for Sports',
				description:
					'Specialized conditioning for athletes. Enhance performance, prevent injuries, and develop mental focus through targeted yoga practices.',
				icon: 'activity',
				schedule: 'By appointment',
				highlight: 'Mental & physical conditioning'
			},
			{
				id: 'personal',
				title: 'Personal & At-home Classes',
				description:
					'One-on-one sessions tailored to your needs. Includes meditation, pre/post-natal yoga, injury prevention, and therapeutic practices.',
				icon: 'home',
				schedule: 'Flexible scheduling',
				highlight: 'Customized to your goals'
			},
			{
				id: 'corporate',
				title: 'Corporate Wellness',
				description:
					'Bring yoga to your workplace. Office programs, team sessions, and wellness workshops designed to reduce stress and boost productivity.',
				icon: 'briefcase',
				schedule: 'Custom programs',
				highlight: 'Team sessions available'
			},
			{
				id: 'workshops',
				title: 'Workshops & Retreats',
				description:
					'Intensive sessions for deeper learning. Explore specific topics, refine your practice, and immerse yourself in extended yoga experiences.',
				icon: 'calendar',
				schedule: 'Check upcoming events',
				highlight: 'Intensive learning'
			}
		],
		schedule: {
			title: 'Weekly Schedule',
			items: [
				{ day: 'Monday', time: '7:00 - 8:00 AM', class: 'Online Yoga', location: 'Zoom' },
				{
					day: 'Tuesday',
					time: '6:30 - 7:30 AM',
					class: 'Ashtanga Vinyasa',
					location: 'Sportsmed Mumbai'
				},
				{ day: 'Wednesday', time: '7:00 - 8:00 AM', class: 'Online Yoga', location: 'Zoom' },
				{
					day: 'Thursday',
					time: '6:30 - 7:30 AM',
					class: 'Ashtanga Vinyasa',
					location: 'Sportsmed Mumbai'
				},
				{ day: 'Friday', time: '7:00 - 8:00 AM', class: 'Online Yoga', location: 'Zoom' }
			]
		},
		cta: {
			title: 'Ready to Begin?',
			description: 'Explore our upcoming workshops or book a personal consultation.',
			primaryButton: { label: 'View Workshops', href: '/workshops' },
			secondaryButton: { label: 'Contact Us', href: '/contact' }
		}
	}
};
