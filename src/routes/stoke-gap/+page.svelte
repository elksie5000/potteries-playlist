<script>
	import LeafletMap from '$lib/components/LeafletMap.svelte';

	// Hardcoded center between Stoke and Manchester
	const gapVenue = {
		name: 'The Stoke Gap',
		era: '1980-1995',
		lat: 53.15,
		lng: -2.2, // Rough midpoint
		special: null
	};
</script>

<div class="min-h-screen bg-zinc-950 p-8">
	<header class="text-center mb-12">
		<h1 class="text-6xl font-black text-white uppercase tracking-tighter">The Stoke Gap</h1>
		<p class="text-xl text-zinc-500 font-serif italic mt-4">
			Visualizing the "M6 Bypass" Effect (1980-1995)
		</p>
	</header>

	<div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
		<div class="space-y-6">
			<div class="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
				<h2 class="text-2xl font-bold text-white mb-4">The Theory</h2>
				<p class="text-zinc-400 leading-relaxed">
					Stoke-on-Trent sits precariously between two musical gravity wells: Manchester (The
					Hacienda, Oasis) and Birmingham (Black Sabbath, UB40).
				</p>
				<p class="text-zinc-400 leading-relaxed mt-4">
					Between 1980 and 1995, major touring acts increasingly skipped Stoke, favoring the larger
					catchment areas of its neighbors. This visualization maps the "dead zone" of cancelled
					dates and tour omissions.
				</p>
			</div>

			<div class="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
				<h2 class="text-2xl font-bold text-white mb-4">Data Points</h2>
				<ul class="space-y-2 text-zinc-400 font-mono text-sm">
					<li class="flex justify-between">
						<span>Oasis (1994)</span>
						<span class="text-red-500">SKIPPED STOKE</span>
					</li>
					<li class="flex justify-between">
						<span>Nirvana (1991)</span>
						<span class="text-red-500">SKIPPED STOKE</span>
					</li>
					<li class="flex justify-between">
						<span>Radiohead (1993)</span>
						<span class="text-green-500">PLAYED WHEATSHEAF</span>
					</li>
				</ul>
			</div>
		</div>

		<div class="h-[600px] border-2 border-zinc-800 rounded-xl overflow-hidden relative">
			<LeafletMap venue={gapVenue} />
			<div
				class="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-zinc-950/80"
			></div>
			<div class="absolute bottom-8 left-8 right-8 text-center">
				<p class="font-bold text-white bg-red-600 inline-block px-4 py-1">
					MISSING DATA: SPATIAL ANALYSIS PENDING
				</p>
			</div>
		</div>
	</div>
</div>
