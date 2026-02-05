import type { BookingWithDetails } from '$lib/server/bookings';

const APP_NAME = 'Happy Yogi';
const APP_URL = process.env.PUBLIC_APP_URL || 'https://happyyogi.in';

function formatPrice(paise: number): string {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		minimumFractionDigits: 0
	}).format(paise / 100);
}

// Reserved for future workshop date formatting
// function formatDate(date: Date | string): string {
// 	return new Date(date).toLocaleDateString('en-IN', {
// 		weekday: 'long',
// 		day: 'numeric',
// 		month: 'long',
// 		year: 'numeric'
// 	});
// }

const baseStyles = `
	body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
	.container { max-width: 600px; margin: 0 auto; background: white; }
	.header { background: linear-gradient(135deg, #b8860b, #2f4f4f); color: white; padding: 30px; text-align: center; }
	.header h1 { margin: 0; font-size: 24px; }
	.content { padding: 30px; }
	.footer { background: #f9f9f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
	.button { display: inline-block; background: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
	.info-box { background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; }
	.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
	.info-row:last-child { border-bottom: none; }
	.highlight { color: #b8860b; font-weight: 600; }
`;

function wrapInTemplate(content: string, preheader: string = ''): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${APP_NAME}</title>
	<style>${baseStyles}</style>
</head>
<body>
	${preheader ? `<span style="display:none;font-size:0;color:#fff;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
	<div class="container">
		<div class="header">
			<h1>${APP_NAME}</h1>
		</div>
		<div class="content">
			${content}
		</div>
		<div class="footer">
			<p>This email was sent by ${APP_NAME}</p>
			<p>2nd Floor, Sportsmed Mumbai, Parel West, Mumbai 400025</p>
			<p><a href="${APP_URL}">happyyogi.in</a></p>
		</div>
	</div>
</body>
</html>`;
}

export function bookingConfirmationEmail(booking: BookingWithDetails): {
	subject: string;
	htmlBody: string;
	textBody: string;
} {
	const content = `
		<h2>Booking Confirmed!</h2>
		<p>Hi ${booking.user.name || 'there'},</p>
		<p>Thank you for booking <strong>${booking.workshop.title}</strong>. Your spot is reserved!</p>

		<div class="info-box">
			<h3 style="margin-top:0;">Booking Details</h3>
			<div class="info-row">
				<span>Booking ID</span>
				<span class="highlight">#${booking.id.slice(0, 8).toUpperCase()}</span>
			</div>
			<div class="info-row">
				<span>Workshop</span>
				<span>${booking.workshop.title}</span>
			</div>
			${booking.workshop.venue_name ? `
			<div class="info-row">
				<span>Venue</span>
				<span>${booking.workshop.venue_name}</span>
			</div>
			` : ''}
			<div class="info-row">
				<span>Amount Paid</span>
				<span class="highlight">${formatPrice(booking.workshop.price_paise)}</span>
			</div>
		</div>

		<p style="text-align: center; margin-top: 30px;">
			<a href="${APP_URL}/bookings/${booking.id}" class="button">View Booking</a>
		</p>

		<p style="margin-top: 30px;">We look forward to seeing you!</p>
		<p>Namaste,<br>The ${APP_NAME} Team</p>
	`;

	const textBody = `
Booking Confirmed!

Hi ${booking.user.name || 'there'},

Thank you for booking ${booking.workshop.title}. Your spot is reserved!

Booking Details:
- Booking ID: #${booking.id.slice(0, 8).toUpperCase()}
- Workshop: ${booking.workshop.title}
${booking.workshop.venue_name ? `- Venue: ${booking.workshop.venue_name}` : ''}
- Amount Paid: ${formatPrice(booking.workshop.price_paise)}

View your booking: ${APP_URL}/bookings/${booking.id}

We look forward to seeing you!

Namaste,
The ${APP_NAME} Team
	`.trim();

	return {
		subject: `Booking Confirmed - ${booking.workshop.title}`,
		htmlBody: wrapInTemplate(content, 'Your booking is confirmed!'),
		textBody
	};
}

export function paymentReminderEmail(booking: BookingWithDetails): {
	subject: string;
	htmlBody: string;
	textBody: string;
} {
	const content = `
		<h2>Payment Reminder</h2>
		<p>Hi ${booking.user.name || 'there'},</p>
		<p>We noticed your payment for <strong>${booking.workshop.title}</strong> is still pending.</p>

		<div class="info-box">
			<h3 style="margin-top:0;">Booking Details</h3>
			<div class="info-row">
				<span>Workshop</span>
				<span>${booking.workshop.title}</span>
			</div>
			<div class="info-row">
				<span>Amount Due</span>
				<span class="highlight">${formatPrice(booking.workshop.price_paise)}</span>
			</div>
		</div>

		<p>To complete your booking, please make the payment and upload the proof:</p>

		<p style="text-align: center; margin-top: 30px;">
			<a href="${APP_URL}/bookings/${booking.id}" class="button">Complete Payment</a>
		</p>

		<p style="margin-top: 30px; color: #666; font-size: 14px;">
			Note: Your spot is held for a limited time. Please complete the payment soon to avoid losing your reservation.
		</p>

		<p>Namaste,<br>The ${APP_NAME} Team</p>
	`;

	const textBody = `
Payment Reminder

Hi ${booking.user.name || 'there'},

We noticed your payment for ${booking.workshop.title} is still pending.

Booking Details:
- Workshop: ${booking.workshop.title}
- Amount Due: ${formatPrice(booking.workshop.price_paise)}

Complete your payment: ${APP_URL}/bookings/${booking.id}

Your spot is held for a limited time. Please complete the payment soon.

Namaste,
The ${APP_NAME} Team
	`.trim();

	return {
		subject: `Payment Reminder - ${booking.workshop.title}`,
		htmlBody: wrapInTemplate(content, 'Please complete your payment'),
		textBody
	};
}

export function paymentConfirmedEmail(booking: BookingWithDetails): {
	subject: string;
	htmlBody: string;
	textBody: string;
} {
	const content = `
		<h2>Payment Confirmed!</h2>
		<p>Hi ${booking.user.name || 'there'},</p>
		<p>Great news! We've received your payment for <strong>${booking.workshop.title}</strong>.</p>

		<div class="info-box" style="background: #e8f5e9;">
			<h3 style="margin-top:0; color: #2e7d32;">✓ Payment Received</h3>
			<div class="info-row">
				<span>Amount</span>
				<span class="highlight">${formatPrice(booking.workshop.price_paise)}</span>
			</div>
			<div class="info-row">
				<span>Booking ID</span>
				<span>#${booking.id.slice(0, 8).toUpperCase()}</span>
			</div>
		</div>

		<p>Your booking is now confirmed. We'll send you a reminder closer to the workshop date.</p>

		<p style="text-align: center; margin-top: 30px;">
			<a href="${APP_URL}/bookings/${booking.id}" class="button">View Booking</a>
		</p>

		<p style="margin-top: 30px;">See you soon!</p>
		<p>Namaste,<br>The ${APP_NAME} Team</p>
	`;

	const textBody = `
Payment Confirmed!

Hi ${booking.user.name || 'there'},

Great news! We've received your payment for ${booking.workshop.title}.

Payment Details:
- Amount: ${formatPrice(booking.workshop.price_paise)}
- Booking ID: #${booking.id.slice(0, 8).toUpperCase()}

Your booking is now confirmed. We'll send you a reminder closer to the workshop date.

View your booking: ${APP_URL}/bookings/${booking.id}

See you soon!

Namaste,
The ${APP_NAME} Team
	`.trim();

	return {
		subject: `Payment Received - ${booking.workshop.title}`,
		htmlBody: wrapInTemplate(content, 'Your payment has been received!'),
		textBody
	};
}

export function contactFormEmail(submission: {
	name: string;
	email: string | null;
	phone: string | null;
	message: string;
}): {
	subject: string;
	htmlBody: string;
	textBody: string;
} {
	const content = `
		<h2>New Contact Form Submission</h2>

		<div class="info-box">
			<div class="info-row">
				<span>Name</span>
				<span>${submission.name}</span>
			</div>
			${submission.email ? `
			<div class="info-row">
				<span>Email</span>
				<span><a href="mailto:${submission.email}">${submission.email}</a></span>
			</div>
			` : ''}
			${submission.phone ? `
			<div class="info-row">
				<span>Phone</span>
				<span><a href="tel:${submission.phone}">${submission.phone}</a></span>
			</div>
			` : ''}
		</div>

		<h3>Message</h3>
		<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${submission.message}</div>
	`;

	const textBody = `
New Contact Form Submission

Name: ${submission.name}
${submission.email ? `Email: ${submission.email}` : ''}
${submission.phone ? `Phone: ${submission.phone}` : ''}

Message:
${submission.message}
	`.trim();

	return {
		subject: `Contact Form: ${submission.name}`,
		htmlBody: wrapInTemplate(content),
		textBody
	};
}
