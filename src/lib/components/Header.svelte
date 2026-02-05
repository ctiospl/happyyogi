<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import {
		Sheet,
		SheetTrigger,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetClose
	} from '$lib/components/ui/sheet';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { onMount } from 'svelte';

	const navLinks = [
		{ href: '/about-us', label: 'About Us' },
		{ href: '/services', label: 'Services' },
		{ href: '/success-stories', label: 'Success Stories' },
		{ href: '/contact', label: 'Contact' }
	];

	let sheetOpen = $state(false);
	let scrolled = $state(false);

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 50;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border backdrop-blur-md transition-all duration-300 {scrolled ? 'bg-background/95' : 'bg-background/80'}"
>
	<div
		class="mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8"
		class:h-16={scrolled}
		class:h-24={!scrolled}
	>
		<!-- Logo -->
		<a
			href="/"
			class="flex items-center transition-all duration-300"
		>
			<img
				src="/images/logo-full.jpg"
				alt="The Happy Yogi Co."
				class="transition-all duration-300 object-contain {scrolled ? 'h-10' : 'h-14 sm:h-16'}"
			/>
		</a>

		<!-- Desktop Nav -->
		<nav aria-label="Primary navigation" class="hidden items-center gap-8 md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="group relative py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
					class:text-primary={isActive(link.href)}
				>
					{link.label}
					<!-- Underline -->
					<span
						class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full"
						class:w-full={isActive(link.href)}
					></span>
				</a>
			{/each}
		</nav>

		<!-- Desktop CTA -->
		<div class="hidden md:block">
			<Button
				href="/workshops"
				class="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 {scrolled ? 'text-sm px-4 py-2' : ''}"
			>
				Upcoming Workshops
			</Button>
		</div>

		<!-- Mobile Menu -->
		<div class="md:hidden">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger
					class="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Open navigation menu"
				>
					<MenuIcon class="size-5" />
				</SheetTrigger>
				<SheetContent side="right" class="w-72">
					<SheetHeader>
						<SheetTitle>
							<img
								src="/images/logo-full.jpg"
								alt="The Happy Yogi Co."
								class="h-12 w-auto object-contain"
							/>
						</SheetTitle>
					</SheetHeader>
					<nav aria-label="Mobile navigation" class="mt-8 flex flex-col gap-4">
						{#each navLinks as link (link.href)}
							<SheetClose>
								<a
									href={link.href}
									class="relative block py-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
									class:text-primary={isActive(link.href)}
									onclick={() => (sheetOpen = false)}
								>
									{link.label}
									{#if isActive(link.href)}
										<span class="absolute bottom-0 left-0 h-0.5 w-8 bg-primary"></span>
									{/if}
								</a>
							</SheetClose>
						{/each}
						<div class="mt-4 pt-4 border-t border-border">
							<Button
								href="/workshops"
								class="w-full bg-accent text-accent-foreground hover:bg-accent/90"
								onclick={() => (sheetOpen = false)}
							>
								Upcoming Workshops
							</Button>
						</div>
					</nav>
				</SheetContent>
			</Sheet>
		</div>
	</div>
</header>
