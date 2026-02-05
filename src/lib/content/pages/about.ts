/**
 * About Us page content for Happy Yogi Shaala
 */

export const aboutPage = {
	slug: 'about-us',
	title: 'About Us',
	seo: {
		title: 'About Happy Yogi Shaala | Mumbai Yoga Studio',
		description:
			'Founded in 2016 in Lower Parel, Happy Yogi Shaala is an urban oasis bridging traditional yoga with modern life. Meet our certified instructors.'
	},
	sections: [
		{
			id: 'story',
			type: 'story',
			heading: 'Our Story',
			subheading: 'An Urban Oasis in the Heart of Mumbai',
			content: [
				'Founded in 2016 in Lower Parel/Prabhadevi, Happy Yogi Shaala emerged from a vision to create an urban oasis where ancient yogic traditions meet modern city life.',
				'In a metropolis that never sleeps, we recognized the need for a sanctuary where Mumbaikars could reconnect with themselves. Our approach goes beyond physical asanas—we embrace yoga as a complete lifestyle, integrating breathwork, meditation, and philosophical teachings.',
				'What sets us apart is our commitment to bridging tradition and modernity. Our instructors bring decades of combined experience from lineages including Ashtanga Vinyasa, Iyengar, and classical Hatha, adapting these time-tested methods for contemporary practitioners.',
				'Today, Happy Yogi Shaala continues to serve as a transformative space where students of all levels discover not just flexibility and strength, but clarity of mind and peace of spirit.'
			]
		},
		{
			id: 'values',
			type: 'values-grid',
			heading: 'Our Values',
			values: [
				{
					title: 'Holistic Practice',
					description:
						'Beyond asanas—we integrate pranayama, meditation, and yogic philosophy for complete well-being.'
				},
				{
					title: 'Authentic Lineage',
					description:
						'Teachings from classical traditions including Mysore Ashtanga, Iyengar, and Vipassana meditation.'
				},
				{
					title: 'Accessible Excellence',
					description:
						'World-class instruction adapted for all levels, from curious beginners to dedicated practitioners.'
				},
				{
					title: 'Community First',
					description:
						'More than a studio—a supportive sangha where practitioners inspire and uplift each other.'
				}
			]
		},
		{
			id: 'instructors',
			type: 'instructor-grid',
			heading: 'Meet Our Teachers',
			subheading: 'Certified practitioners with diverse backgrounds and shared dedication',
			instructors: [
				{
					name: 'Divya Rao',
					slug: 'divya-rao',
					image: '/images/instructors/divya-rao.webp',
					specializations: ['Hatha Yoga', 'Ashtanga Vinyasa'],
					bio: 'Divya brings a unique multidimensional perspective to her teaching. Trained in Mysore, she combines rigorous Ashtanga practice with deep contemplative work, having practiced Vipassana meditation since 2009. Her journey includes earning a 2nd degree Taekwondo black belt and working as an acclaimed film producer on projects like Dangal. This diverse background informs her teaching, helping students understand that discipline, creativity, and mindfulness are interconnected.',
					credentials: [
						'Mysore Ashtanga trained',
						'Vipassana practitioner since 2009',
						'2nd degree Taekwondo black belt',
						'Film producer (Dangal)'
					]
				},
				{
					name: 'Deepa Rao',
					slug: 'deepa-rao',
					image: '/images/instructors/deepa-rao.webp',
					specializations: ['Ashtanga Vinyasa', 'Iyengar Yoga', 'Ayurveda'],
					bio: "Deepa's yoga journey is rooted in two of India's most respected traditions—the David Garrigues/Pattabhi Jois Ashtanga lineage and the precision-focused Iyengar method. Her unique strength lies in weaving Ayurvedic principles into her classes, helping students understand how their individual constitution affects their practice. Before dedicating herself fully to yoga, Deepa built a successful career in corporate advertising.",
					credentials: [
						'Ashtanga Vinyasa (David Garrigues/Pattabhi Jois lineage)',
						'Iyengar Yoga certified',
						'Ayurvedic principles integration',
						'Corporate advertising background'
					]
				},
				{
					name: 'Vijesh Nair',
					slug: 'vijesh-nair',
					image: '/images/instructors/vijesh-nair.webp',
					specializations: ['Yoga for Sports', 'Conditioning', 'Therapeutic Yoga'],
					bio: "As co-founder of Happy Yogi Shaala, Vijesh has been instrumental in shaping the studio's vision. His pioneering 'Yoga for Sports' initiative, featured in The Times of India, demonstrates how ancient practices can enhance modern athletic performance. A Yoga Alliance certified instructor, Vijesh specializes in mental and physical conditioning, helping athletes unlock new levels of performance while preventing injury.",
					credentials: [
						'Happy Yogi Shaala co-founder',
						'Yoga Alliance certified',
						'"Yoga for Sports" pioneer (Times of India featured)',
						'Mental & physical conditioning specialist'
					]
				}
			]
		},
		{
			id: 'cta',
			type: 'cta-banner',
			heading: 'Begin Your Journey',
			subheadline:
				'Whether you are new to yoga or deepening an existing practice, we welcome you to experience Happy Yogi Shaala.',
			cta: {
				text: 'View Our Services',
				href: '/services'
			}
		}
	]
} as const;

export type AboutPage = typeof aboutPage;
export type AboutSection = (typeof aboutPage.sections)[number];
export type Instructor = (typeof aboutPage.sections)[2]['instructors'][number];
