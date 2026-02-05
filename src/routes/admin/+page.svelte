<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Calendar, Users, CreditCard, BookOpen } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const statCards = [
		{ title: 'Workshops', key: 'workshops' as const, icon: Calendar, href: '/admin/workshops', color: 'text-chart-1' },
		{ title: 'Bookings', key: 'bookings' as const, icon: BookOpen, href: '/admin/bookings', color: 'text-chart-2' },
		{ title: 'Users', key: 'users' as const, icon: Users, href: '/admin/users', color: 'text-chart-3' },
		{ title: 'Pending Payments', key: 'pendingPayments' as const, icon: CreditCard, href: '/admin/payments', color: 'text-chart-4' }
	];
</script>

<svelte:head>
	<title>Dashboard | Admin | {data.tenant?.name}</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Dashboard</h1>
		<p class="text-muted-foreground">Welcome back{data.user?.name ? `, ${data.user.name}` : ''}</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each statCards as stat}
			<a href={stat.href} class="block">
				<Card class="hover:bg-muted/50 transition-colors">
					<CardHeader class="flex flex-row items-center justify-between pb-2">
						<CardTitle class="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
						<stat.icon class="h-4 w-4 {stat.color}" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{data.stats[stat.key]}</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>
</div>
