<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { openGig } from '$lib/stores/modalStore';

	export let venues = [];
	export let timeline = [];
	export let activeVenueId = null;

	let observer;
	let gridElement;

	// Emitting active year or venue for parent to handle map/narrative
	export let onYearChange = (y) => {};
	export let onVenueHover = (vId) => {};

	// Simple intersection observer to detect which year/row is visible
	onMount(() => {
		if (browser) {
			const options = {
				root: null,
				rootMargin: '-40% 0px -40% 0px', // Active when in middle of screen
				threshold: 0
			};

			observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const y = parseInt(entry.target.dataset.year);
						if (!isNaN(y)) onYearChange(y);
					}
				});
			}, options);

			const rows = document.querySelectorAll('.timeline-row');
			rows.forEach((r) => observer.observe(r));
		}
	});

	// Reactive grid style string
	$: gridStyle = `grid-template-columns: 80px repeat(${venues.length}, minmax(140px, 1fr));`;

	/* Tier 2: Grid Header (Aligned) */
	$: headerGridStyle = gridStyle;

	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
</script>

<div class="w-full relative bg-zinc-950/50 backdrop-blur-sm" bind:this={gridElement}>
	<!-- Fixed A-Z Rolodex (Right Flank) -->
	<div
		class="fixed right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 items-center opacity-40 hover:opacity-100 transition-opacity hidden md:flex"
	>
		{#each alphabet as char}
			<button
				class="text-[9px] font-mono text-zinc-500 hover:text-amber-500 hover:scale-150 transition-all cursor-pointer"
			>
				{char}
			</button>
		{/each}
	</div>

	<!-- Two-Tier Sticky Header -->
	<div class="sticky top-0 z-20 bg-zinc-900/95 border-b border-zinc-700 shadow-xl backdrop-blur-md">
		<!-- Tier 1: Horizontal Scroll Row (Venue Filters) -->
		<div
			class="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-zinc-800/50 py-2 px-12 gap-2"
		>
			{#each venues as venue}
				<button
					class="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all
					{activeVenueId === venue.id
						? 'bg-zinc-100 text-zinc-900 border-zinc-100'
						: 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-500 hover:text-zinc-300'}"
					onclick={() => (activeVenueId = activeVenueId === venue.id ? null : venue.id)}
				>
					{venue.name.replace('The ', '')}
				</button>
			{/each}
		</div>

		<!-- Tier 2: Simplified Grid Header -->
		<div class="grid" style={headerGridStyle}>
			<div
				class="p-2 text-[10px] font-mono text-zinc-600 border-r border-zinc-800 flex items-center justify-center font-bold tracking-wider"
			>
				YEAR
			</div>
			{#each venues as venue}
				<div
					class="p-2 text-[10px] font-black text-zinc-500 border-r border-zinc-800 truncate hover:text-zinc-300 transition-colors cursor-help uppercase tracking-wide text-center flex items-center justify-center
					{activeVenueId === venue.id ? 'bg-zinc-800/50 text-amber-500' : ''}"
					title={venue.name}
					onmouseenter={() => onVenueHover(venue.id)}
				>
					{venue.name.replace('The ', '').substring(0, 3)}
				</div>
			{/each}
		</div>
	</div>

	<!-- Timeline Body -->
	<div class="divide-y divide-zinc-800 font-mono text-xs">
		{#each timeline as row}
			<div
				class="timeline-row grid hover:bg-zinc-900/40 transition-colors group"
				data-year={row.year}
				style={gridStyle}
			>
				<div
					class="p-4 text-zinc-500 border-r border-zinc-800 bg-zinc-950/30 flex flex-col justify-center items-center text-center group-hover:text-zinc-300"
				>
					<span class="font-bold text-sm block">{row.year}</span>
					<span class="text-[9px] uppercase tracking-wider opacity-60"
						>{new Date(row.year, row.month - 1)
							.toLocaleString('default', { month: 'short' })
							.toUpperCase()}</span
					>
				</div>

				{#each venues as venue}
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<div
						class="p-4 border-r border-zinc-800/50 flex flex-col justify-center min-h-[60px] relative {activeVenueId ===
						venue.id
							? 'bg-zinc-900/50'
							: ''}"
						onmouseover={() => onVenueHover(venue.id)}
					>
						{#if row.entries[venue.id]}
							{@const val = row.entries[venue.id]}
							import {openGig} from '$lib/stores/modalStore'; // ... existing imports ... // ... (inside
							the loop) ...
							<!-- Handle Array (Multiple Gigs), Object (Rich Data), or String (Legacy) -->
							{#if Array.isArray(val)}
								<div class="flex flex-col gap-3">
									{#each val as gig}
										<button
											class="text-center w-full hover:bg-white/5 rounded p-1 transition-colors cursor-pointer text-left"
											onclick={() => openGig(gig)}
										>
											<span class="text-zinc-100 font-medium leading-snug break-words block">
												{gig.artist}
											</span>
											{#if gig.has_songs}
												<div class="mt-0.5" title="Setlist info available">
													<span
														class="text-[9px] text-amber-500 font-mono tracking-tighter border border-amber-900/50 bg-amber-950/30 px-1 rounded"
													>
														♪ LIST
													</span>
												</div>
											{/if}
										</button>
									{/each}
								</div>
							{:else if typeof val === 'object' && val !== null}
								<button
									class="text-center w-full hover:bg-white/5 rounded p-1 transition-colors cursor-pointer"
									onclick={() => openGig(val)}
								>
									<span class="text-zinc-100 font-medium leading-snug break-words block">
										{val.artist}
									</span>
									{#if val.has_songs}
										<div class="mt-1" title="Setlist info available">
											<span
												class="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] border border-amber-500/20 font-mono"
											>
												♪ SONGS
											</span>
										</div>
									{/if}
								</button>
							{:else}
								<span
									class="text-zinc-100 font-medium leading-snug break-words relative z-10 text-center block"
								>
									{val}
								</span>
							{/if}

							<!-- Subtle highlight for event -->
							<div
								class="absolute inset-x-0 bottom-0 top-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
							></div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}

		<!-- Empty spacers if sparse data -->
		{#if timeline.length === 0}
			<div class="p-10 text-center text-zinc-500">Loading archive data...</div>
		{/if}
	</div>
</div>

<style>
	/* Layout-specific Encapsulation */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}

	.rolodex-strip {
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}
</style>
