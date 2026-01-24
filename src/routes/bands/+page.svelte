<script>
	import { openDrawer } from '$lib/stores/navigation';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	// --- State ---
	let selectedLetter = $state('All');
	let selectedGenre = $state('All');
	let showSetlistsOnly = $state(false);

	// --- Constants ---
	const alphabet = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
	const genres = ['Rock', 'Soul', 'Punk', 'Indie', 'Rave', 'Ska/Two-Tone'];

	// --- Helpers ---
	function getGenre(artist) {
		// Stable hash
		let hash = 0;
		for (let i = 0; i < artist.length; i++) {
			hash = artist.charCodeAt(i) + ((hash << 5) - hash);
		}
		return genres[Math.abs(hash) % genres.length];
	}

	// --- Derived ---
	let groupedArtists = $derived.by(() => {
		// 1. Group by Artist from data.archive
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

        // 4. Group by Letter for the Loop
        const letters = {};
        list.forEach(g => {
            const l = g.name[0].toUpperCase();
            if (!letters[l]) letters[l] = [];
            letters[l].push(g);
        });

        // 5. Return Array for #each
		return Object.keys(letters).sort().map(l => ({
            letter: l,
            artists: letters[l]
        }));
	});
</script>

<div class="flex h-screen bg-zinc-950 overflow-hidden font-sans">
	<!-- A-Z Strip (Rolodex Handle) -->
	<nav
		class="w-12 md:w-16 flex flex-col items-center bg-zinc-900 border-r border-zinc-800 overflow-y-auto no-scrollbar py-24 select-none z-20 shrink-0"
	>
		{#each alphabet as letter}
			<button
				class="font-mono text-xs font-bold py-1.5 w-full text-zinc-600 hover:text-amber-500 transition-colors"
				class:text-amber-500={selectedLetter === letter}
				onclick={() => (selectedLetter = letter)}
			>
				{letter}
			</button>
		{/each}
	</nav>

	<!-- Main Content Area -->
	<main class="flex-1 flex flex-col overflow-hidden">
		<!-- Header -->
		<header
			class="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10"
		>
			<div class="flex items-center gap-4">
				<h1 class="text-xl font-black text-zinc-100 uppercase tracking-tight">Bands</h1>
				<div class="flex gap-2">
					<select
						class="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
						bind:value={selectedGenre}
					>
						<option value="All">All Genres</option>
						{#each genres as genre}
							<option value={genre}>{genre}</option>
						{/each}
					</select>
					<button
						class="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
						class:bg-amber-900/30={showSetlistsOnly}
						class:border-amber-900/50={showSetlistsOnly}
						class:text-amber-500={showSetlistsOnly}
						onclick={() => (showSetlistsOnly = !showSetlistsOnly)}
					>
						Setlists Only
					</button>
				</div>
			</div>
		</header>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto no-scrollbar p-4">
			{#each groupedArtists as { letter, artists }}
				<section class="mb-8" transition:fade={{ duration: 150 }}>
					<h2 class="text-2xl font-black text-zinc-700 uppercase mb-4">{letter}</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each artists as group}
							<button
								class="flex items-center justify-between w-full text-left bg-zinc-900 border border-zinc-800 p-3 hover:bg-zinc-800 hover:border-zinc-600 transition-colors group/row"
								onclick={() => openDrawer('band', group)}
							>
								<div class="flex items-center gap-4">
									<div
										class="w-12 font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover/row:text-zinc-400"
									>
										{group.gigs.length} Gigs
									</div>
									<div
										class="font-black text-lg text-zinc-100 uppercase tracking-tight group-hover/row:text-amber-500 transition-colors truncate"
									>
										{group.name}
									</div>
								</div>
								
								<div class="hidden sm:block text-[10px] text-zinc-600 uppercase font-mono tracking-widest group-hover/row:text-zinc-500">
									View →
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
		</div>
	</main>
</div>
