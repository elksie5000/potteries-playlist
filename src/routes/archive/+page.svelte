<script>
	import { activeGig } from '$lib/stores/modalStore';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	// --- State ---
	let selectedLetter = $state('All');
	let selectedGenre = $state('All');
	let showSetlistsOnly = $state(false);

	// --- Constants ---
	const alphabet = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
	const genres = ['Rock', 'Soul', 'Punk', 'Indie', 'Rave'];

	// --- Helpers ---
	function getGenre(artist) {
		// Stable hash to assign a consistent genre prototype
		let hash = 0;
		for (let i = 0; i < artist.length; i++) {
			hash = artist.charCodeAt(i) + ((hash << 5) - hash);
		}
		return genres[Math.abs(hash) % genres.length];
	}

	function openGig(gig) {
		let url = gig.url || '';
		// Construct gig object for modal
		activeGig.set({
			...gig,
			has_songs: gig.has_songs,
			url: url,
			full_lineup: gig.artist
		});
	}

	// --- Derived ---
	let groupedArtists = $derived.by(() => {
		// 1. Group by Artist
		const groups = {};
		data.archive.forEach((gig) => {
			if (!groups[gig.artist]) {
				groups[gig.artist] = {
					name: gig.artist,
					genre: getGenre(gig.artist),
					gigs: []
				};
			}
			groups[gig.artist].gigs.push(gig);
		});

		// 2. Convert to Array and Sort
		let list = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));

		// 3. Filter
		if (selectedLetter !== 'All') {
			list = list.filter((g) => g.name.toUpperCase().startsWith(selectedLetter));
		}

		if (selectedGenre !== 'All') {
			list = list.filter((g) => g.genre === selectedGenre);
		}

		if (showSetlistsOnly) {
			list = list
				.map((g) => ({
					...g,
					gigs: g.gigs.filter((gig) => gig.has_songs)
				}))
				.filter((g) => g.gigs.length > 0);
		}

		return list;
	});
</script>

<div class="flex h-screen bg-zinc-950 overflow-hidden font-sans">
	<!-- A-Z Strip (Rolodex Handle) -->
	<nav
		class="w-12 md:w-16 flex flex-col items-center bg-zinc-900 border-r border-zinc-800 overflow-y-auto no-scrollbar py-24 select-none z-20 shrink-0"
	>
		{#each alphabet as letter}
			<button
				class="w-full text-[10px] md:text-xs font-black uppercase py-2 md:py-3 text-center transition-all hover:bg-zinc-800 hover:text-white
                {selectedLetter === letter ? 'text-amber-500 scale-125' : 'text-zinc-600'}"
				onclick={() => (selectedLetter = letter)}
			>
				{letter}
			</button>
		{/each}
	</nav>

	<!-- Main Content Area -->
	<main class="flex-1 flex flex-col h-full overflow-hidden relative">
		<!-- Filters Bar (Sticky Top) -->
		<div
			class="h-24 md:h-24 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 md:px-12 shrink-0 z-10"
		>
			<div class="flex flex-col">
				<h1 class="text-2xl font-black text-white uppercase tracking-tighter">The Rolodex</h1>
				<span class="text-xs text-zinc-500 font-mono">{groupedArtists.length} Artists Found</span>
			</div>

			<div class="flex gap-4 items-center">
				<!-- Genre Filter -->
				<div class="hidden md:flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
					<button
						class="px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all {selectedGenre ===
						'All'
							? 'bg-zinc-700 text-white shadow'
							: 'text-zinc-500 hover:text-zinc-300'}"
						onclick={() => (selectedGenre = 'All')}>All</button
					>
					{#each genres as g}
						<button
							class="px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all {selectedGenre ===
							g
								? 'bg-zinc-700 text-white shadow'
								: 'text-zinc-500 hover:text-zinc-300'}"
							onclick={() => (selectedGenre = g)}>{g}</button
						>
					{/each}
				</div>

				<!-- Mobile Genre Dropdown -->
				<select
					bind:value={selectedGenre}
					class="md:hidden bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2 py-2 rounded uppercase font-bold outline-none"
				>
					<option value="All">All Genres</option>
					{#each genres as g}
						<option value={g}>{g}</option>
					{/each}
				</select>

				<!-- Toggle -->
				<button
					onclick={() => (showSetlistsOnly = !showSetlistsOnly)}
					class="flex items-center gap-2 px-3 py-2 rounded border transition-all text-[10px] uppercase font-bold tracking-wider
                    {showSetlistsOnly
						? 'bg-amber-900/20 border-amber-500 text-amber-500'
						: 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600'}"
				>
					<div
						class="w-2 h-2 rounded-full {showSetlistsOnly ? 'bg-amber-500' : 'bg-zinc-700'}"
					></div>
					<span class="hidden sm:inline">Records Only</span>
				</button>
			</div>
		</div>

		<!-- Scrollable List -->
		<div class="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-12 scrollbar-thin">
			{#each groupedArtists as group (group.name)}
				<section
					class="relative pl-4 md:pl-0 border-l border-zinc-800 md:border-none"
					transition:fade={{ duration: 300 }}
				>
					<!-- Artist Header -->
					<div
						class="sticky top-0 bg-zinc-950/95 py-4 z-0 border-b border-zinc-800 mb-6 flex justify-between items-baseline"
					>
						<h2
							class="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter w-full truncate"
						>
							{group.name}
						</h2>
						<span
							class="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1 rounded shrink-0 ml-4"
						>
							{group.genre}
						</span>
					</div>

					<!-- Cards Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{#each group.gigs as gig}
							<button
								class="text-left bg-zinc-100 p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_rgba(245,158,11,1)] hover:-translate-y-0.5 transition-all duration-200 border-2 border-zinc-900 group"
								style="filter: contrast(1.1) grayscale(1);"
								onclick={() => openGig(gig)}
							>
								<div class="flex justify-between items-start mb-6 border-b-2 border-zinc-900 pb-2">
									<span class="font-mono text-xs font-bold text-zinc-900">{gig.date}</span>
									{#if gig.has_songs}
										<span class="text-[10px] font-black uppercase bg-black text-white px-1"
											>REC</span
										>
									{/if}
								</div>

								<div class="h-12 flex flex-col justify-end">
									<div
										class="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1"
									>
										Venue
									</div>
									<div class="text-sm font-black text-zinc-900 uppercase leading-tight truncate">
										{gig.venue}
									</div>
								</div>
							</button>
						{/each}
					</div>
				</section>
			{/each}

			{#if groupedArtists.length === 0}
				<div class="py-24 text-center opacity-50">
					<p class="text-2xl font-black text-zinc-700 uppercase">No Files Found</p>
					<p class="text-sm font-mono text-zinc-600 mt-2">Try adjusting your loop filters.</p>
				</div>
			{/if}

			<div class="h-24"></div>
			<!-- Footer padding -->
		</div>
	</main>
</div>
