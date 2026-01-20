<script>
	import { openGig } from '$lib/stores/modalStore';
	import { newsEvents } from '$lib/config/news-config';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();

	// --- STATE ---
	// Extract unique values immediately
	const uniqueDecades = Array.from(new Set(data.decades)).sort((a, b) => a - b);
	const uniqueVenues = Array.from(new Set(data.archive.map((g) => g.venue))).sort();

	let allDecades = $state(uniqueDecades);
	let allVenues = $state(uniqueVenues);

	// Initialize filters with ALL content selected
	let selectedDecades = $state(new Set(uniqueDecades));
	let selectedVenues = $state(new Set(uniqueVenues));
	let showDetailedOnly = $state(false);
	let searchQuery = $state('');

	// Filters UI state
	let filtersOpen = $state(false);

	// (Deleted $effect as init is done above)

	// Toggle Logic with "Isolate on First Click" behavior
	function toggleDecade(d) {
		if (selectedDecades.size === allDecades.length) {
			// If all are currently selected, isolate the clicked one
			selectedDecades = new Set([d]);
		} else {
			// Standard toggle
			const next = new Set(selectedDecades);
			if (next.has(d)) {
				next.delete(d);
				// If we deleted the last one, maybe select all again? Or leave empty?
				// User said "deselect all except button pressed", implying we want to drive down to specifics.
				// If empty, let's reset to ALL to avoid blank screen?
				if (next.size === 0) {
					selectedDecades = new Set(allDecades);
				} else {
					selectedDecades = next;
				}
			} else {
				next.add(d);
				// If we added the last one back, we are at ALL state
				selectedDecades = next;
			}
		}
	}

	function toggleVenue(v) {
		if (selectedVenues.size === allVenues.length) {
			selectedVenues = new Set([v]);
		} else {
			const next = new Set(selectedVenues);
			if (next.has(v)) {
				next.delete(v);
				if (next.size === 0) {
					selectedVenues = new Set(allVenues);
				} else {
					selectedVenues = next;
				}
			} else {
				next.add(v);
				selectedVenues = next;
			}
		}
	}

	function toggleAllDecades(select) {
		if (select) {
			allDecades.forEach((d) => selectedDecades.add(d));
		} else {
			selectedDecades.clear();
		}
		selectedDecades = new Set(selectedDecades);
	}

	function toggleAllVenues(select) {
		if (select) {
			allVenues.forEach((v) => selectedVenues.add(v));
		} else {
			selectedVenues.clear();
		}
		selectedVenues = new Set(selectedVenues);
	}

	// --- DERIVED DATA ---
	let timelineData = $derived.by(() => {
		const yMap = new Map();

		// 1. Filter Gigs
		const filtered = data.archive.filter((gig) => {
			const decadeActive = selectedDecades.has(gig.decade);
			const venueActive = selectedVenues.has(gig.venue);
			const detailMatches = !showDetailedOnly || gig.has_songs;
			return decadeActive && venueActive && detailMatches;
		});

		// 2. Group by Year
		filtered.forEach((gig) => {
			if (!yMap.has(gig.year)) {
				yMap.set(gig.year, { type: 'year', year: gig.year, gigs: [], news: null });
			}
			yMap.get(gig.year).gigs.push(gig);
		});

		// 3. Add News (only if year exists in data OR matches filter?)
		// Logic: Only show news if the year is visible or adjacent?
		// Let's attach news only to existing years for now to avoid empty years with just news.
		// OR: If the user selected the decade, maybe we should show the year even if empty?
		// User asked for "contracted timeline". So likely only years with gigs.
		newsEvents.forEach((n) => {
			if (yMap.has(n.year)) {
				yMap.get(n.year).news = n;
			}
		});

		const sortedYears = Array.from(yMap.values()).sort((a, b) => a.year - b.year);

		// 4. Insert Gaps
		const finalTimeline = [];
		for (let i = 0; i < sortedYears.length; i++) {
			const current = sortedYears[i];

			// Push current year
			finalTimeline.push(current);

			// Check next
			if (i < sortedYears.length - 1) {
				const next = sortedYears[i + 1];
				if (next.year > current.year + 1) {
					// GAP DETECTED
					finalTimeline.push({
						type: 'gap',
						start: current.year + 1,
						end: next.year - 1,
						diff: next.year - current.year - 1
					});
				}
			}
		}

		return finalTimeline;
	});

	function getVenueColor(v) {
		const low = v.toLowerCase();
		if (low.includes('torch'))
			return 'border-orange-500/30 bg-orange-950/20 hover:border-orange-500/60';
		if (low.includes('sugar'))
			return 'border-purple-500/30 bg-purple-950/20 hover:border-purple-500/60';
		if (low.includes('wheat')) return 'border-red-500/30 bg-red-950/20 hover:border-red-500/60';
		if (low.includes('vic')) return 'border-blue-500/30 bg-blue-950/20 hover:border-blue-500/60';
		if (low.includes('place'))
			return 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/60';
		if (low.includes('shelley'))
			return 'border-pink-500/30 bg-pink-950/20 hover:border-pink-500/60';
		return 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500';
	}
</script>

<div
	class="h-screen w-full bg-zinc-950 overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scroll-smooth relative"
>
	<!-- FILTER CONTROLS (Floating) -->
	<!-- FILTER CONTROLS (Fixed Top Right) -->
	<!-- FILTER CONTROLS (Fixed Top Right) -->
	<div
		class="fixed top-20 right-6 z-40 flex items-start gap-4 pointer-events-auto origin-top-right scale-90 md:scale-100 hidden md:flex"
	>
		<!-- Detailed Filter Toggle -->
		<button
			onclick={() => (showDetailedOnly = !showDetailedOnly)}
			class="bg-zinc-950/90 backdrop-blur-md border {showDetailedOnly
				? 'border-amber-500 text-amber-500 bg-amber-950/30'
				: 'border-zinc-800 text-zinc-500 hover:text-zinc-300'} px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl h-full min-h-[44px]"
		>
			{showDetailedOnly ? 'Show All Gigs' : '★ Setlists Only'}
		</button>

		<!-- Main Filter Group -->
		<div
			class="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl flex gap-8"
		>
			<!-- Eras Column -->
			<div class="flex flex-col gap-3 border-r border-zinc-800 pr-8">
				<div class="flex justify-between items-center">
					<span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Eras</span>
					<div class="flex gap-2">
						<button
							onclick={() => toggleAllDecades(true)}
							class="text-[8px] font-bold uppercase text-zinc-600 hover:text-white transition-colors"
							>All</button
						>
						<span class="text-[8px] text-zinc-700">/</span>
						<button
							onclick={() => toggleAllDecades(false)}
							class="text-[8px] font-bold uppercase text-zinc-600 hover:text-white transition-colors"
							>None</button
						>
					</div>
				</div>
				<div class="flex gap-1.5">
					{#each allDecades as d}
						<button
							class="px-2 py-1.5 text-[10px] uppercase font-mono border rounded transition-all {selectedDecades.has(
								d
							)
								? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/50'
								: 'border-zinc-800 bg-zinc-900 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'}"
							onclick={() => toggleDecade(d)}
						>
							{d}s
						</button>
					{/each}
				</div>
			</div>

			<!-- Venues Column -->
			<div class="flex flex-col gap-3 max-w-[340px]">
				<div class="flex justify-between items-center">
					<span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Venues</span>
					<div class="flex gap-2">
						<button
							onclick={() => toggleAllVenues(true)}
							class="text-[8px] font-bold uppercase text-zinc-600 hover:text-white transition-colors"
							>All</button
						>
						<span class="text-[8px] text-zinc-700">/</span>
						<button
							onclick={() => toggleAllVenues(false)}
							class="text-[8px] font-bold uppercase text-zinc-600 hover:text-white transition-colors"
							>None</button
						>
					</div>
				</div>
				<div class="flex flex-wrap gap-x-4 gap-y-2 justify-end">
					{#each allVenues as v}
						<button
							onclick={() => toggleVenue(v)}
							class="text-[10px] uppercase font-bold tracking-tight transition-colors flex items-center gap-1.5 group {selectedVenues.has(
								v
							)
								? 'text-zinc-200'
								: 'text-zinc-700 hover:text-zinc-500 line-through decoration-zinc-800'}"
						>
							<span
								class="w-2 h-2 rounded-full {selectedVenues.has(v)
									? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
									: 'bg-zinc-800'} transition-colors"
							></span>
							{v.replace('The ', '')}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Intro Section -->
	<section
		class="min-w-full md:min-w-[80vw] h-full snap-center flex flex-col justify-center items-center bg-zinc-950 relative border-r border-zinc-900"
	>
		<h1
			class="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter text-center leading-none z-10"
		>
			The<br />Potteries<br /><span class="text-amber-600">Playlist</span>
		</h1>
		<p class="mt-6 text-zinc-500 font-mono tracking-[0.3em] text-xs uppercase z-10">
			1965 — 2010 • An Oral History
		</p>

		<!-- Background Decor -->
		<div
			class="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent"
		></div>
	</section>

	{#each timelineData as item}
		{#if item.type === 'year'}
			<!-- YEAR SECTION -->
			<section
				class="h-full min-w-[320px] max-w-[400px] border-r border-zinc-900 bg-zinc-950 relative snap-start flex flex-col pt-32 pb-8 px-6 group transition-colors hover:bg-zinc-900/20"
			>
				<!-- Year Background -->
				<div
					class="absolute top-8 left-4 text-[120px] font-black text-zinc-900 select-none z-0 leading-none transition-colors group-hover:text-zinc-800/80"
				>
					{item.year}
				</div>

				<!-- News Layer (Mid Z) -->
				{#if item.news}
					<div
						class="relative z-10 mb-8 bg-zinc-200 text-zinc-900 p-4 shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform -rotate-1 border border-zinc-400 max-w-[90%]"
					>
						<div class="flex justify-between items-center border-b border-zinc-400 pb-1 mb-2">
							<span class="font-black uppercase text-[10px] tracking-widest text-red-700"
								>Evening Sentinel</span
							>
							<span class="font-mono text-[9px] text-zinc-600">{item.year}</span>
						</div>
						<h3 class="font-bold text-lg leading-tight mb-1 font-serif">{item.news.title}</h3>
						<p class="text-xs font-serif leading-relaxed opacity-80">
							{item.news.description}
						</p>
					</div>
				{/if}

				<!-- Gigs Layer (Front Z) -->
				<div
					class="relative z-20 flex-1 overflow-y-auto pr-2 space-y-3 mt-4 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
				>
					{#each item.gigs as gig}
						<button
							class="w-full text-left p-3 rounded backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl group/card border
                            {getVenueColor(gig.venue)}
                            {gig.has_songs ? 'border-l-4 border-l-amber-400 pl-4' : ''}"
							onclick={() => openGig(gig)}
						>
							<div class="flex justify-between items-baseline mb-1">
								<span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider"
									>{gig.date}</span
								>
								<span
									class="text-[9px] font-mono text-zinc-500 uppercase truncate max-w-[80px] text-right"
									>{gig.venue}</span
								>
							</div>
							<div
								class="font-black text-zinc-200 text-sm leading-tight group-hover/card:text-white transition-colors"
							>
								{gig.artist}
							</div>

							<!-- Metadata badges -->
							{#if gig.has_songs}
								<div class="mt-2 flex gap-2">
									<span
										class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 rounded uppercase font-bold tracking-wider"
									>
										♪ Setlist
									</span>
								</div>
							{/if}
						</button>
					{/each}
				</div>

				<!-- Floor Reflection line -->
				<div
					class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
				></div>
			</section>
		{:else if item.type === 'gap'}
			<!-- GAP SECTION -->
			<section
				class="h-full min-w-[100px] max-w-[150px] snap-center flex flex-col items-center justify-center bg-zinc-950/50 border-r border-zinc-900 relative"
			>
				<div class="h-full w-px border-l border-dashed border-zinc-800 absolute left-1/2"></div>
				<div
					class="z-10 bg-zinc-950 p-2 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-600 uppercase tracking-widest rotate-90 whitespace-nowrap"
				>
					Running Gap {item.diff}
					{item.diff > 1 ? 'Years' : 'Year'}
				</div>
			</section>
		{/if}
	{/each}

	<!-- Outro -->
	<section
		class="min-w-[50vw] h-full snap-center flex flex-col items-center justify-center border-r border-zinc-900 bg-zinc-950"
	>
		<div class="text-center">
			<h2 class="text-4xl font-bold text-zinc-700 uppercase tracking-tighter">End of Tape</h2>
			<div class="w-16 h-1 bg-zinc-800 mx-auto my-6"></div>
			<a
				href="/archive"
				class="inline-block text-amber-600 hover:text-amber-500 font-mono text-sm tracking-widest uppercase hover:underline underline-offset-8"
				>Explore the Archive →</a
			>
		</div>
	</section>
</div>

<style>
	/* Hide scrollbar for section but allow scrolling */
	.scrollbar-thin::-webkit-scrollbar {
		width: 4px;
	}
	.scrollbar-thumb-zinc-800 {
		background-color: #27272a;
		border-radius: 2px;
	}
</style>
