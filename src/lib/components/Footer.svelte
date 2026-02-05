<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { Instagram, Mail, Phone } from '@lucide/svelte';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();

	const quickLinks = [
		{ label: 'About Us', href: '/about-us' },
		{ label: 'Services', href: '/services' },
		{ label: 'Success Stories', href: '/success-stories' },
		{ label: 'Contact', href: '/contact' },
		{ label: 'Privacy', href: '/privacy' },
		{ label: 'Terms', href: '/terms' }
	];

	const contactInfo = {
		phone: '+91 98200 09173',
		email: 'info@thehappyyogico.com',
		instagram: '@theshaala'
	};
</script>

<footer
	bind:this={ref}
	class={cn('bg-brand-burgundy py-12', className)}
	{...restProps}
>
	<div class="container mx-auto px-6">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<!-- Brand + Tagline -->
			<div class="space-y-4">
				<h3 class="font-display text-2xl font-semibold text-secondary-foreground">The Happy Yogi Co.</h3>
				<p class="text-secondary-foreground/80 max-w-xs text-sm leading-relaxed">
					Where wellness meets joy. Transform your life through the ancient practice of yoga.
				</p>
			</div>

			<!-- Quick Links -->
			<div class="space-y-4">
				<h4 class="font-display text-lg font-semibold text-secondary-foreground">Quick Links</h4>
				<nav aria-label="Footer navigation" class="flex flex-col space-y-2">
					{#each quickLinks as link (link.href)}
						<a
							href={link.href}
							class="text-secondary-foreground/80 hover:text-accent text-sm transition-colors duration-200"
						>
							{link.label}
						</a>
					{/each}
				</nav>
			</div>

			<!-- Contact Info -->
			<div class="space-y-4">
				<h4 class="font-display text-lg font-semibold text-secondary-foreground">Contact Us</h4>
				<div class="space-y-3">
					<a
						href="tel:{contactInfo.phone.replace(/\s/g, '')}"
						class="text-secondary-foreground/80 hover:text-accent flex items-center gap-3 text-sm transition-colors duration-200"
					>
						<Phone class="h-4 w-4" />
						{contactInfo.phone}
					</a>
					<a
						href="mailto:{contactInfo.email}"
						class="text-secondary-foreground/80 hover:text-accent flex items-center gap-3 text-sm transition-colors duration-200"
					>
						<Mail class="h-4 w-4" />
						{contactInfo.email}
					</a>
					<a
						href="https://instagram.com/{contactInfo.instagram.replace('@', '')}"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Follow us on Instagram (opens in new window)"
						class="text-secondary-foreground/80 hover:text-accent flex items-center gap-3 text-sm transition-colors duration-200"
					>
						<Instagram class="h-4 w-4" />
						{contactInfo.instagram}
					</a>
				</div>
			</div>
		</div>

		<!-- Copyright -->
		<div class="border-secondary-foreground/20 mt-10 border-t pt-6 text-center">
			<p class="text-secondary-foreground/60 text-sm">&copy; 2026 The Happy Yogi Co. All rights reserved.</p>
		</div>
	</div>
</footer>
