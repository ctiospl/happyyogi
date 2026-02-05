import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.js';

const { Pool } = pg;

async function seed() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const db = new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString })
		})
	});

	console.log('Seeding database...');

	// Create Happy Yogi tenant
	const [tenant] = await db
		.insertInto('tenants')
		.values({
			name: 'Happy Yogi Shaala',
			slug: 'happyyogi',
			domain: 'happyyogi.in',
			timezone: 'Asia/Kolkata',
			currency: 'INR',
			settings: JSON.stringify({
				booking_hold_minutes: 30,
				reminder_hours: [24, 1],
				allow_waitlist: true
			}),
			theme: JSON.stringify({
				primary_color: 'oklch(0.75 0.15 85)',
				secondary_color: 'oklch(0.55 0.12 220)'
			}),
			updated_at: new Date()
		})
		.returning('id')
		.execute();

	console.log(`Created tenant: ${tenant.id}`);

	// Create admin user (Chintan - will use phone OTP to login)
	const [adminUser] = await db
		.insertInto('users')
		.values({
			phone: '+919876543210', // Placeholder - update with real phone
			phone_verified_at: new Date(),
			name: 'Admin',
			email: 'admin@happyyogi.in',
			updated_at: new Date()
		})
		.returning('id')
		.execute();

	console.log(`Created admin user: ${adminUser.id}`);

	// Link admin to tenant
	await db
		.insertInto('user_tenant_links')
		.values({
			user_id: adminUser.id,
			tenant_id: tenant.id,
			role: 'admin',
			updated_at: new Date()
		})
		.execute();

	console.log('Linked admin to tenant');

	// Create instructor users
	const instructors = [
		{
			name: 'Divya Rao',
			phone: '+919000000001',
			slug: 'divya-rao',
			bio: 'Trained in Hatha and Ashtanga Vinyasa traditions in Mysore. A long-time practitioner of Vipassana meditation since 2009 and a 2nd degree Taekwondo black belt. Acclaimed film producer of blockbuster hits including Dangal.',
			certifications: ['Hatha Yoga', 'Ashtanga Vinyasa', 'Mysore Trained'],
			specializations: ['Hatha', 'Ashtanga Vinyasa', 'Meditation'],
			teaching_philosophy:
				'Yoga is a journey inward. Through disciplined practice and mindful awareness, we unlock our highest potential.'
		},
		{
			name: 'Deepa Rao',
			phone: '+919000000002',
			slug: 'deepa-rao',
			bio: 'Practices Ashtanga Vinyasa in the tradition of David Garrigues and Sri K. Pattabhi Jois. Also trained in Iyengar yoga and Ayurveda. Background in corporate advertising brings a unique perspective to teaching.',
			certifications: ['Ashtanga Vinyasa', 'Iyengar', 'Ayurveda'],
			specializations: ['Ashtanga Vinyasa', 'Iyengar', 'Ayurveda'],
			teaching_philosophy:
				'The practice meets you where you are. Through patience and dedication, the body opens and the mind stills.'
		},
		{
			name: 'Vijesh Nair',
			phone: '+919000000003',
			slug: 'vijesh-nair',
			bio: 'Co-founder of Happy Yogi and Yoga Alliance certified instructor. Featured in Times of India for pioneering the "Yoga for Sports" initiative, bringing yoga practices to athletes and sports professionals.',
			certifications: ['Yoga Alliance RYT-200', 'Sports Yoga'],
			specializations: ['Sports Yoga', 'Athletic Performance', 'Strength Building'],
			teaching_philosophy:
				'Yoga enhances every aspect of physical performance. Athletes and non-athletes alike benefit from this ancient wisdom.'
		}
	];

	for (const inst of instructors) {
		const [user] = await db
			.insertInto('users')
			.values({
				phone: inst.phone,
				phone_verified_at: new Date(),
				name: inst.name,
				updated_at: new Date()
			})
			.returning('id')
			.execute();

		await db
			.insertInto('user_tenant_links')
			.values({
				user_id: user.id,
				tenant_id: tenant.id,
				role: 'user',
				updated_at: new Date()
			})
			.execute();

		await db
			.insertInto('instructors')
			.values({
				user_id: user.id,
				slug: inst.slug,
				bio: inst.bio,
				certifications: JSON.stringify(inst.certifications),
				specializations: JSON.stringify(inst.specializations),
				teaching_philosophy: inst.teaching_philosophy,
				gallery: '[]',
				updated_at: new Date()
			})
			.execute();

		console.log(`Created instructor: ${inst.name}`);
	}

	// Create core pages
	const corePages = [
		{ slug: 'home', title: 'Home', template: 'home' },
		{ slug: 'about', title: 'About', template: 'about' },
		{ slug: 'instructors', title: 'Instructors', template: 'instructors' },
		{ slug: 'philosophy', title: 'Philosophy', template: 'philosophy' },
		{ slug: 'workshops', title: 'Workshops', template: 'workshops' },
		{ slug: 'gallery', title: 'Gallery', template: 'gallery' },
		{ slug: 'contact', title: 'Contact', template: 'contact' }
	];

	for (const page of corePages) {
		await db
			.insertInto('pages')
			.values({
				tenant_id: tenant.id,
				slug: page.slug,
				title: page.title,
				template: page.template,
				status: 'draft',
				updated_at: new Date()
			})
			.execute();

		console.log(`Created page: ${page.title}`);
	}

	// Create sample workshop
	const divyaInstructor = await db
		.selectFrom('instructors')
		.innerJoin('users', 'users.id', 'instructors.user_id')
		.where('users.name', '=', 'Deepa Rao')
		.select('instructors.id')
		.executeTakeFirst();

	if (divyaInstructor) {
		const [workshop] = await db
			.insertInto('workshops')
			.values({
				tenant_id: tenant.id,
				instructor_id: divyaInstructor.id,
				title: 'Weekend Ashtanga Intensive',
				slug: 'weekend-ashtanga-intensive',
				description:
					'A transformative weekend immersion into the Ashtanga Vinyasa practice. Perfect for practitioners looking to deepen their understanding of the Primary Series.',
				content_html: `
					<h2>What to Expect</h2>
					<p>This intensive weekend workshop offers a deep dive into the Ashtanga Vinyasa Primary Series.
					Led by Deepa Rao, who trained directly in the traditions of David Garrigues and Sri K. Pattabhi Jois,
					you'll receive personalized adjustments and insights into the subtle aspects of the practice.</p>

					<h2>Schedule</h2>
					<ul>
						<li><strong>Saturday Morning:</strong> Full Primary Series with Adjustments</li>
						<li><strong>Saturday Afternoon:</strong> Philosophy & Pranayama</li>
						<li><strong>Sunday Morning:</strong> Mysore-style Practice</li>
						<li><strong>Sunday Afternoon:</strong> Q&A and Integration</li>
					</ul>

					<h2>Who Should Attend</h2>
					<p>This workshop is suitable for practitioners with at least 6 months of consistent yoga practice.
					No prior Ashtanga experience is required, but a basic understanding of Sun Salutations is helpful.</p>
				`,
				faqs: JSON.stringify([
					{
						question: 'What should I bring?',
						answer:
							'Bring your own yoga mat, a small towel, and comfortable clothing. Water will be provided.'
					},
					{
						question: 'Is this suitable for beginners?',
						answer:
							'We recommend at least 6 months of yoga practice. Complete beginners may find this intensive challenging.'
					},
					{
						question: 'Can I attend just one day?',
						answer:
							'The workshop is designed as a complete experience. Single-day attendance is not available.'
					}
				]),
				venue_name: 'Sportsmed Mumbai',
				venue_address:
					'2nd Floor, Parel Premises, Sayani & Gokhale Road South Junction, Opp Motilal Oswal Towers, Parel West, Mumbai 400025',
				mode: 'offline',
				capacity: 20,
				price_paise: 500000, // ₹5,000
				deposit_amount_paise: 200000, // ₹2,000
				booking_hold_minutes: 30,
				cancellation_policy:
					'Full refund if cancelled 7+ days before. 50% refund if cancelled 3-7 days before. No refund within 3 days.',
				status: 'published',
				seo_title: 'Weekend Ashtanga Intensive | Happy Yogi',
				seo_description:
					'Join Deepa Rao for a transformative weekend immersion into Ashtanga Vinyasa Primary Series at Happy Yogi, Mumbai.',
				updated_at: new Date()
			})
			.returning('id')
			.execute();

		// Create workshop sessions
		const nextSaturday = new Date();
		nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7) + 7);

// Calculate workshop dates
		const satDate = new Date();
		satDate.setDate(satDate.getDate() + ((6 - satDate.getDay() + 7) % 7 || 7) + 7);

		await db
			.insertInto('workshop_sessions')
			.values([
				{
					workshop_id: workshop.id,
					title: 'Full Primary Series with Adjustments',
					starts_at: new Date(satDate.getFullYear(), satDate.getMonth(), satDate.getDate(), 7, 0),
					ends_at: new Date(satDate.getFullYear(), satDate.getMonth(), satDate.getDate(), 10, 0),
					session_order: 1
				},
				{
					workshop_id: workshop.id,
					title: 'Philosophy & Pranayama',
					starts_at: new Date(satDate.getFullYear(), satDate.getMonth(), satDate.getDate(), 15, 0),
					ends_at: new Date(satDate.getFullYear(), satDate.getMonth(), satDate.getDate(), 17, 0),
					session_order: 2
				},
				{
					workshop_id: workshop.id,
					title: 'Mysore-style Practice',
					starts_at: new Date(
						satDate.getFullYear(),
						satDate.getMonth(),
						satDate.getDate() + 1,
						7,
						0
					),
					ends_at: new Date(
						satDate.getFullYear(),
						satDate.getMonth(),
						satDate.getDate() + 1,
						10,
						0
					),
					session_order: 3
				},
				{
					workshop_id: workshop.id,
					title: 'Q&A and Integration',
					starts_at: new Date(
						satDate.getFullYear(),
						satDate.getMonth(),
						satDate.getDate() + 1,
						15,
						0
					),
					ends_at: new Date(
						satDate.getFullYear(),
						satDate.getMonth(),
						satDate.getDate() + 1,
						17,
						0
					),
					session_order: 4
				}
			])
			.execute();

		console.log(`Created workshop: ${workshop.id} with sessions`);
	}

	await db.destroy();
	console.log('Seed completed successfully!');
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
