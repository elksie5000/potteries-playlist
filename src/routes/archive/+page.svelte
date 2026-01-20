<script>
	let { data } = $props();
	let searchTerm = $state('');
	let selectedDecade = $state('all');

	let filtered = $derived(
		data.archive.filter((g) => {
			const matchesSearch =
				searchTerm === '' ||
				g.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
				g.venue.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesDecade = selectedDecade === 'all' || g.decade === parseInt(selectedDecade);
			return matchesSearch && matchesDecade;
		})
	);
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-300 p-8 font-mono">
	<header
		class="mb-8 flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-4"
	>
		<div>
			<h1 class="text-3xl font-black text-white uppercase tracking-tighter">The Archive</h1>
			<p class="text-zinc-500 text-sm mt-1">
				{filtered.length} Records Found
			</p>
		</div>

		<div class="flex gap-4 mt-4 md:mt-0">
			<select
				class="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
				bind:value={selectedDecade}
			>
				<option value="all">All Decades</option>
				{#each data.decades as decade}
					<option value={decade}>{decade}s</option>
				{/each}
			</select>

			<input
				type="text"
				placeholder="Search artists or venues..."
				class="bg-zinc-900 border border-zinc-700 text-white text-sm rounded px-3 py-2 w-64 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-zinc-600"
				bind:value={searchTerm}
			/>
		</div>
	</header>

	<div class="overflow-x-auto shadow-2xl rounded border border-zinc-800 bg-zinc-900/50">
		<table class="w-full text-left text-sm whitespace-nowrap">
			<thead
				class="bg-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-xs border-b border-zinc-800"
			>
				<tr>
					<th class="px-6 py-4">Date</th>
					<th class="px-6 py-4">Artist</th>
					<th class="px-6 py-4">Venue</th>
					<th class="px-6 py-4">Decade</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-800">
				{#each filtered.slice(0, 200) as gig}
					<!-- Limit 200 for perf in proto, maybe virtualize later -->
					<tr class="hover:bg-zinc-800/50 transition-colors">
						<td class="px-6 py-3 font-mono text-amber-500/80">{gig.date}</td>
						<td class="px-6 py-3 font-bold text-zinc-200">{gig.artist}</td>
						<td class="px-6 py-3 text-zinc-400">{gig.venue}</td>
						<td class="px-6 py-3 text-zinc-600">{gig.decade}s</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if filtered.length > 200}
			<div class="p-4 text-center text-zinc-500 text-xs italic">
				Showing first 200 matches only. Refine search to see more.
			</div>
		{/if}
	</div>
</div>
