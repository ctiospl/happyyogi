<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import {
		LayoutDashboard,
		Calendar,
		Users,
		CreditCard,
		FileText,
		Settings,
		LogOut,
		Menu,
		BookOpen
	} from '@lucide/svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/workshops', label: 'Workshops', icon: Calendar },
		{ href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
		{ href: '/admin/payments', label: 'Payments', icon: CreditCard },
		{ href: '/admin/users', label: 'Users', icon: Users },
		{ href: '/admin/pages', label: 'Pages', icon: FileText },
		{ href: '/admin/settings', label: 'Settings', icon: Settings }
	];

	function isActive(href: string): boolean {
		if (href === '/admin') {
			return page.url.pathname === '/admin';
		}
		return page.url.pathname.startsWith(href);
	}
</script>

{#if !data.isAdmin && page.url.pathname === '/admin/login'}
	{@render children()}
{:else}
	<Sidebar.Provider>
		<Sidebar.Root>
			<Sidebar.Header class="border-b border-sidebar-border p-4">
				<a href="/admin" class="flex items-center gap-2">
					{#if data.tenant?.logo_url}
						<img src={data.tenant.logo_url} alt={data.tenant.name} class="h-8 w-auto" />
					{:else}
						<span class="font-display text-lg font-semibold">{data.tenant?.name ?? 'Admin'}</span>
					{/if}
				</a>
			</Sidebar.Header>

			<Sidebar.Content>
				<Sidebar.Group>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each navItems as item}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>
												<item.icon class="h-4 w-4" />
												<span>{item.label}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			</Sidebar.Content>

			<Sidebar.Footer class="border-t border-sidebar-border p-4">
				{#if data.user}
					<div class="flex items-center gap-3">
						<div class="flex-1 truncate">
							<p class="truncate text-sm font-medium">{data.user.name ?? data.user.phone}</p>
							<p class="text-muted-foreground truncate text-xs">{data.user.email ?? ''}</p>
						</div>
						<form action="/api/auth/logout" method="POST">
							<Button variant="ghost" size="icon" type="submit">
								<LogOut class="h-4 w-4" />
							</Button>
						</form>
					</div>
				{/if}
			</Sidebar.Footer>
		</Sidebar.Root>

		<Sidebar.Inset>
			<header class="bg-background/80 sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 backdrop-blur-sm">
				<Sidebar.Trigger>
					<Menu class="h-5 w-5" />
				</Sidebar.Trigger>
				<div class="flex-1"></div>
			</header>

			<main class="flex-1 p-6">
				{@render children()}
			</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
{/if}
