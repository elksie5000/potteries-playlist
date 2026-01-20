<script lang="ts">
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import TimeTravel from '$lib/components/TimeTravel.svelte';

	let { data } = $props();
	let { venue, gigs } = data;

	let selectedYear = $state(1972);

	// Filter gigs based on selected year.
	// Use a range effectively or just matching year? "Time-Travel toggle to filter gigs by year."
	// Let's show gigs from that year.
	let filteredGigs = $derived(gigs.filter((g) => g.year === selectedYear));
</script>

<div class="space-y-8">
	<div class="text-center space-y-2">
		<h1
			class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 uppercase tracking-tighter"
		>
			{venue.name}
		</h1>
		<p class="text-xl text-zinc-400 font-serif italic">{venue.era}</p>
	</div>

	<!-- Map Section -->
	<div class="relative w-full max-w-4xl mx-auto">
		{#if venue}
			<LeafletMap {venue} gigs={filteredGigs} />
		{/if}

		<!-- Overlay the Time Travel control slightly over the map or below it -->
		<div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-md z-10">
			<TimeTravel bind:year={selectedYear} min={1965} max={1979} />
		</div>
	</div>

	<!-- Listings -->
	<div class="mt-24 max-w-3xl mx-auto space-y-6">
		<h2 class="text-2xl font-bold text-zinc-100 border-b border-zinc-800 pb-2">
			Gigs in {selectedYear}
		</h2>

		{#if filteredGigs.length === 0}
			<div class="p-8 text-center bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
				<p class="text-zinc-500">No records found for this year.</p>
			</div>
		{/if}

		<div class="grid gap-4">
			{#each filteredGigs as gig}
				<div
					class="group relative bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-lg p-6 transition-all duration-300 hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] hover:shadow-amber-500/10"
				>
					<div class="flex justify-between items-start">
						<div>
							<h3
								class="text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors"
							>
								{gig.artist}
							</h3>
							<p class="text-zinc-500 text-sm mt-1">{gig.date}</p>
						</div>
						<a
							href={gig.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs font-mono text-amber-500/50 hover:text-amber-500 border border-amber-500/20 hover:border-amber-500 px-2 py-1 rounded transition-colors"
						>
							SETLIST.FM
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
