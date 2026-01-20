<script lang="ts">
	let cleanQuery = $state('');
	let results = $state<any[]>([]);
	let isLoading = $state(false);

	async function searchArtist() {
		if (!cleanQuery) return;
		isLoading = true;

		// Mock search for Sandbox demo
		// In a real app, this would hit the Musicbrainz API or Setlist.fm search endpoint
		setTimeout(() => {
			if (cleanQuery.toLowerCase().includes('bowie')) {
				results = [
					{ date: '1972-06-02', venue: 'Victoria Hall, Hanley', distance: '0 miles' },
					{ date: '1973-05-18', venue: 'Trentham Gardens', distance: '3 miles' }
				];
			} else if (cleanQuery.toLowerCase().includes('oasis')) {
				results = [
					{ date: '1994-09-14', venue: 'The Wheatsheaf', distance: '0 miles' },
					{ date: '2005-07-02', venue: 'City of Manchester Stadium', distance: '35 miles' }
				];
			} else {
				results = [];
			}
			isLoading = false;
		}, 1000);
	}
</script>

<div class="min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center">
	<div class="w-full max-w-2xl space-y-8">
		<header class="text-center space-y-4">
			<h1 class="text-5xl font-black text-white uppercase tracking-tighter">The Sandbox</h1>
			<p class="text-xl text-zinc-500 font-serif italic">Calculate "Stoke Proximity"</p>
		</header>

		<div class="flex gap-4">
			<input
				bind:value={cleanQuery}
				type="text"
				placeholder="Enter Artist Name (e.g. David Bowie)..."
				class="flex-1 bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-xl focus:outline-none focus:border-[#00ff9d] text-lg"
				onkeydown={(e) => e.key === 'Enter' && searchArtist()}
			/>
			<button
				onclick={searchArtist}
				class="bg-[#00ff9d] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#00ccff] transition-colors"
			>
				ANALYZE
			</button>
		</div>

		{#if isLoading}
			<div class="text-center text-zinc-500 animate-pulse">Scanning archives...</div>
		{/if}

		{#if results.length > 0}
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
				<table class="w-full text-left">
					<thead class="bg-zinc-950 text-zinc-500 uppercase text-xs font-bold tracking-wider">
						<tr>
							<th class="p-4">Date</th>
							<th class="p-4">Venue</th>
							<th class="p-4 text-right">Distance to Hanley</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-zinc-800">
						{#each results as res}
							<tr class="hover:bg-zinc-800/50 transition-colors">
								<td class="p-4 text-zinc-300 font-mono">{res.date}</td>
								<td class="p-4 text-white font-bold">{res.venue}</td>
								<td class="p-4 text-right font-mono text-[#00ff9d]">{res.distance}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if !isLoading && cleanQuery}
			<div class="text-center text-zinc-500">
				<p>No direct hits found in Stoke Archives.</p>
				<p class="text-sm mt-2">Nearest simulated gig: Manchester Apollo (35 miles)</p>
			</div>
		{/if}
	</div>
</div>
