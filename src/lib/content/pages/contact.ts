export const contactPage = {
	slug: 'contact',
	title: 'Contact Us',
	seo: {
		title: 'Contact Us | Happy Yogi Shaala',
		description:
			'Get in touch with Happy Yogi Shaala. Visit us at Sportsmed Mumbai, Parel West or reach out via phone, email, or Instagram.',
		ogImage: null
	},
	sections: [
		{
			type: 'hero',
			tagline: 'We would love to hear from you',
			heading: 'Contact Us',
			subheading: 'Reach out for class inquiries, workshop registrations, or any questions'
		},
		{
			type: 'contact-info',
			cards: [
				{
					icon: 'phone',
					title: 'Phone',
					items: [
						{ label: 'Primary', value: '+91 98200 09173', href: 'tel:+919820009173' },
						{ label: 'Secondary', value: '+91 98697 34357', href: 'tel:+919869734357' }
					]
				},
				{
					icon: 'mail',
					title: 'Email',
					items: [
						{
							label: 'General Inquiries',
							value: 'info@thehappyyogico.com',
							href: 'mailto:info@thehappyyogico.com'
						}
					]
				},
				{
					icon: 'instagram',
					title: 'Social',
					items: [
						{
							label: 'Instagram',
							value: '@theshaala',
							href: 'https://instagram.com/theshaala'
						}
					]
				}
			]
		},
		{
			type: 'location',
			heading: 'Visit Us',
			address: {
				name: 'Sportsmed Mumbai',
				lines: [
					'2nd Floor, Parel Premises',
					'Sayani & Gokhale Road South Junction',
					'Opp Motilal Oswal Towers, Parel West',
					'Mumbai 400025, Maharashtra, India'
				],
				landmark: 'Next to Parel ST Depot, Opposite Motilal Oswal Tower'
			},
			map: {
				embedUrl: null, // Replace with Google Maps embed URL
				latitude: 19.0048,
				longitude: 72.8422,
				zoom: 16
			}
		},
		{
			type: 'contact-form',
			heading: 'Send us a Message',
			subheading: 'Fill out the form below and we will get back to you shortly',
			fields: [
				{
					name: 'name',
					label: 'Full Name',
					type: 'text',
					placeholder: 'Your name',
					required: true
				},
				{
					name: 'email',
					label: 'Email',
					type: 'email',
					placeholder: 'your@email.com',
					required: false
				},
				{
					name: 'phone',
					label: 'Phone',
					type: 'tel',
					placeholder: '+91 98XXX XXXXX',
					required: true
				},
				{
					name: 'message',
					label: 'Message',
					type: 'textarea',
					placeholder: 'How can we help you?',
					required: true
				}
			],
			submitLabel: 'Send Message'
		},
		{
			type: 'hours',
			heading: 'Hours of Operation',
			schedule: [
				{ day: 'Monday - Friday', hours: '6:00 AM - 9:00 PM' },
				{ day: 'Saturday', hours: '7:00 AM - 6:00 PM' },
				{ day: 'Sunday', hours: '8:00 AM - 12:00 PM' }
			],
			note: 'Class timings may vary. Please check our schedule for specific class times.'
		}
	]
};

export type ContactPage = typeof contactPage;
export type ContactSection = (typeof contactPage.sections)[number];
