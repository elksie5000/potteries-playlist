<script>
	import { page } from '$app/stores';

	const links = [
		{ href: '/', label: 'The Story' },
		{ href: '/pulse', label: 'The Pulse' },
		{ href: '/archive', label: 'The Archive' }
	];
</script>

<nav
	class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none"
>
	<!-- Brand -->
	<a href="/" class="pointer-events-auto flex flex-col items-start group">
		<span
			class="font-black text-xl text-white tracking-tighter uppercase leading-none group-hover:text-amber-500 transition-colors"
			>Potteries</span
		>
		<span
			class="font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase leading-none group-hover:text-zinc-400 transition-colors"
			>Playlist</span
		>
	</a>

	<!-- Links -->
	<div
		class="pointer-events-auto bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-2 flex gap-6 shadow-2xl"
	>
		{#each links as link}
			<a
				href={link.href}
				class="text-xs font-bold uppercase tracking-wide transition-colors {$page.url.pathname ===
				link.href
					? 'text-amber-500'
					: 'text-zinc-500 hover:text-zinc-300'}"
			>
				{link.label}
			</a>
		{/each}
	</div>

	<!-- Status/Extras -->
	<div class="hidden md:block w-24 text-right pointer-events-auto">
		<!-- Placeholder for maybe user login or simple status indicator -->
		<div class="inline-flex items-center gap-2">
			<span class="text-[9px] font-mono text-zinc-600 uppercase">Live</span>
			<div
				class="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"
			></div>
		</div>
	</div>
</nav>
