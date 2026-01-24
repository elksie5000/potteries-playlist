<script>
	import { openDrawer, activeDrawer } from '$lib/stores/navigation';
	import { newsEvents } from '$lib/config/news-config';
	import { classicGigs } from '$lib/data/classics';
	import { fade, fly } from 'svelte/transition';
	import { send } from '$lib/utils/animation';

	let activeDrawerVal = $state(null);

	// Subscribe to store
	$effect(() => {
		const unsubscribe = activeDrawer.subscribe((v) => (activeDrawerVal = v));
		return unsubscribe;
	});

	let { data } = $props();

	// --- STATE ---
	// --- STATE ---
	// Extract unique values reactively
	let uniqueDecades = $derived(Array.from(new Set(data.decades)).sort((a, b) => a - b));
	let uniqueVenues = $derived(Array.from(new Set(data.archive.map((g) => g.venue))).sort());

	// Initialize filters (We need to update this logic since filters are stateful but data might change)
	// For simplicity in this Svelte 5 migration, we will keep selectedDecades/Venues as independent state
	// initialized once, but we need to watch out for data changes.
	// Actually, let's keep it simple.

	// To silence the warning and ensure correctness:
	// We'll calculate these on init.
	// The warning is: "reference only captures the initial value".

	// We can just suppress it if we know data won't change, OR use $derived.
	// Let's use $derived for the source lists.

	// But `allDecades` and `allVenues` were separate mutable state?
	// Looking at the code: `let allDecades = $state(uniqueDecades);`

	// Let's just fix the variables.

	let allDecades = $derived(Array.from(new Set(data.decades)).sort((a, b) => a - b));
	let allVenues = $derived(Array.from(new Set(data.archive.map((g) => g.venue))).sort());

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

			// Search Filter
			const q = searchQuery.toLowerCase();
			const searchMatches =
				!q ||
				gig.artist.toLowerCase().includes(q) ||
				gig.venue.toLowerCase().includes(q) ||
				gig.date.includes(q);

			return decadeActive && venueActive && detailMatches && searchMatches;
		});

		// 2. Group by Year
		filtered.forEach((gig) => {
			if (!yMap.has(gig.year)) {
				yMap.set(gig.year, { type: 'year', year: gig.year, gigs: [], news: null });
			}
			yMap.get(gig.year).gigs.push(gig);
		});

		// 3. Add News (only if year exists in data OR matches filter?)
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
	<!-- Sticky Header / Filter Bar -->
	<header
		class="fixed top-20 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 transition-transform duration-300"
	>
		<div class="px-6 py-2 flex flex-col gap-2">
			<!-- Row 1: Venues (Horizontal Scroll) -->
			<div class="flex items-center gap-4">
				<div class="w-16 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
					Venues
				</div>
				<div class="flex gap-2 overflow-x-auto no-scrollbar mask-gradient-r">
					<button
						onclick={() => toggleAllVenues(!selectedVenues.size)}
						class="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all shrink-0
						{selectedVenues.size === allVenues.length
							? 'bg-zinc-800 text-zinc-300 border-zinc-700'
							: 'bg-zinc-900 text-zinc-600 border-zinc-800'}"
					>
						All
					</button>
					{#each allVenues as v}
						<button
							onclick={() => toggleVenue(v)}
							class="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all shrink-0 whitespace-nowrap
							{selectedVenues.has(v)
								? 'bg-zinc-100 text-zinc-900 border-zinc-100'
								: 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}"
						>
							{v.replace('The ', '')}
						</button>
					{/each}
				</div>
			</div>

			<!-- Search Bar -->
			<div class="relative w-full max-w-md mx-auto md:mx-0 mt-2">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search artist, venue, or date..."
					class="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-500 transition-colors uppercase tracking-wider font-mono"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="absolute right-2 top-1.5 text-zinc-500 hover:text-white">✕</button
					>
				{/if}
			</div>

			<!-- Row 2: Eras & Toggle (Compact) -->
			<div class="flex items-center justify-between border-t border-zinc-800/50 pt-2">
				<div class="flex items-center gap-4">
					<div class="w-16 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
						Eras
					</div>
					<div class="flex gap-1.5">
						{#each allDecades as d}
							<button
								class="px-2 py-0.5 text-[10px] uppercase font-mono border rounded transition-all {selectedDecades.has(
									d
								)
									? 'bg-amber-600 border-amber-500 text-white'
									: 'border-zinc-800 bg-zinc-900 text-zinc-600 hover:text-zinc-400'}"
								onclick={() => toggleDecade(d)}
							>
								{d}s
							</button>
						{/each}
					</div>
				</div>

				<button
					onclick={() => (showDetailedOnly = !showDetailedOnly)}
					class="px-3 py-1 rounded border text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-2 font-mono
					{showDetailedOnly
						? 'text-amber-500 border-amber-500/50 bg-amber-950/20'
						: 'text-zinc-500 border-zinc-800 bg-zinc-900 hover:text-zinc-300'}"
				>
					<div
						class="w-1.5 h-1.5 rounded-full {showDetailedOnly ? 'bg-amber-500' : 'bg-zinc-600'}"
					></div>
					<span>
						SETLISTS: <span class={showDetailedOnly ? 'text-amber-500' : 'text-zinc-600'}>
							[{showDetailedOnly ? 'ON' : 'OFF'}]
						</span>
					</span>
				</button>
			</div>
		</div>
	</header>

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
			1965 — Present • The Live Archive
		</p>

		<!-- Background Decor -->
		<div
			class="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent"
		></div>
	</section>

	<!-- CLASSICS / NARRATIVE SECTION -->
	<section
		class="min-w-[90vw] md:min-w-[60vw] h-full snap-center bg-zinc-950 border-r border-zinc-900 relative overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 p-8 md:p-16 flex flex-col justify-center"
	>
		<!-- PROSE -->
		<div class="max-w-2xl mx-auto mb-16 border-l-4 border-amber-500 pl-6 md:pl-12 py-2">
			<h2
				class="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6 leading-[0.9]"
			>
				The Lost <br /> <span class="text-amber-500">Tapes</span>
			</h2>
			<div
				class="prose prose-invert prose-sm md:prose-base text-zinc-400 space-y-4 font-mono leading-relaxed"
			>
				<p>
					This project began in the silence following January 10, 2016. The death of <strong
						class="text-white">David Bowie</strong
					>
					didn’t just stop the music; it triggered a forensic audit of memory. Amid the global
					tributes, a local fact resurfaced: the Starman had walked among us. He played
					<span class="text-white bg-zinc-900 px-1">Victoria Hall</span> in 1973, at the absolute zenith
					of Glam Rock.
				</p>
				<p>
					It raised a question: <em>Who else?</em>
				</p>
				<p>
					The answer lay buried in the <a
						href="https://www.setlist.fm"
						target="_blank"
						class="text-amber-500 hover:underline">setlist.fm</a
					> database. Over 2,500 gigs. A timeline that proves Stoke-on-Trent wasn't just a flyover state
					for rock and roll—it was a crucible.
				</p>
				<p>
					From the sweaty walls of <strong class="text-white">The Golden Torch</strong> in Tunstall
					where Northern Soul found its feet, to <strong class="text-white">The Place</strong> in
					Hanley hosting The Who. We hosted the chaos of the
					<strong class="text-white">Sex Pistols</strong>
					era (often misremembered, but never forgotten) and the anthems of
					<strong class="text-white">Oasis</strong>
					at the Wheatsheaf on the very day they released <em>Supersonic</em>.
				</p>
				<p class="text-amber-500 font-bold uppercase tracking-widest text-xs">
					This is not nostalgia. It is evidence.
				</p>
			</div>
		</div>

		<!-- KEY EVIDENCE GRID -->
		<div class="max-w-5xl mx-auto w-full">
			<h3
				class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-2"
			>
				Key Evidence type: Class A
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each classicGigs as classic}
					{@const realGig = data.archive.find(
						(g) =>
							g.artist.toLowerCase() === classic.artist.toLowerCase() && g.date === classic.date
					)}

					<!-- If we find the real gig, allow opening the drawer. If not, just show static card (fallback). -->
					<button
						class="text-left group border border-zinc-800 bg-zinc-900/40 p-5 hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all duration-300 relative overflow-hidden"
						onclick={() => realGig && openDrawer('gig', realGig)}
						disabled={!realGig}
					>
						{#if !realGig}
							<div
								class="absolute inset-0 bg-red-500/10 z-0 flex items-center justify-center pointer-events-none"
							>
								<span
									class="text-[10px] font-mono text-red-500 -rotate-12 border border-red-500 px-1 uppercase"
									>Archival Miss</span
								>
							</div>
						{/if}

						<div class="relative z-10">
							<div class="flex justify-between items-start mb-3">
								<span class="text-amber-500 font-bold text-xs tracking-tight font-mono"
									>{classic.date}</span
								>
								<div class="flex gap-1 flex-wrap justify-end">
									{#each classic.tags as tag}
										<span
											class="text-[9px] uppercase border border-zinc-700 px-1.5 py-0.5 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-400 bg-zinc-950"
											>{tag}</span
										>
									{/each}
								</div>
							</div>
							<h3
								class="text-xl font-black text-white uppercase tracking-tighter mb-1 leading-none"
							>
								{classic.artist}
							</h3>
							<div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
								{classic.venue}
							</div>
							<p
								class="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3 group-hover:border-zinc-700 font-serif opacity-80 group-hover:opacity-100"
							>
								{classic.notes}
							</p>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</section>

	{#each timelineData as item}
		{#if item.type === 'year'}
			<!-- YEAR SECTION -->
			<section
				class="h-full min-w-[320px] max-w-[400px] border-r border-zinc-900 bg-zinc-950 relative snap-start flex flex-col pt-64 pb-8 px-6 group transition-colors hover:bg-zinc-900/20"
			>
				<!-- Year Background -->
				<div
					class="absolute top-40 left-4 text-[120px] font-black text-zinc-900 select-none z-0 leading-none transition-colors group-hover:text-zinc-800/80"
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
								>The News</span
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
						{@const isSelected =
							activeDrawerVal?.type === 'gig' &&
							(activeDrawerVal.data.id === gig.id ||
								(activeDrawerVal.data.artist === gig.artist &&
									activeDrawerVal.data.date === gig.date))}

						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div class="relative">
							<!-- Ghost Placeholder (keeps layout space) -->
							{#if isSelected}
								<div
									class="w-full p-3 rounded border border-transparent opacity-0 pointer-events-none"
								>
									<div class="h-4"></div>
									<div class="h-4"></div>
								</div>
							{/if}

							<!-- Moving Card -->
							{#if !isSelected}
								<button
									class="w-full text-left p-3 rounded backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl group/card border
									{getVenueColor(gig.venue)}
									{gig.has_songs ? 'border-l-4 border-l-amber-400 pl-4' : ''}
									"
									onclick={() => openDrawer('gig', gig)}
									out:send={{ key: gig.id || gig.artist + gig.date }}
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
										<div class="mt-2">
											{#if showDetailedOnly && gig.songs && gig.songs.length > 0}
												<!-- Preview removed to keep cards clean. Full list is in Sidecar. -->
											{/if}
											<span
												class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 rounded uppercase font-bold tracking-wider"
											>
												♪ Setlist
											</span>
										</div>
									{/if}
								</button>
							{/if}
						</div>
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
