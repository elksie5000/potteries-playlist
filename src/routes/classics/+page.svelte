<script>
	import { classicGigs } from '$lib/data/classic-gigs';
	import { activeGig } from '$lib/stores/modalStore';

	function openClassicGig(gig) {
		// Construct a compatible gig object for the modal
		// The modal expects { url, has_songs, ... }
		// It parses ID from url end.
		let url = '';
		if (gig.setlistId && gig.setlistId !== 'null') {
			url = `https://www.setlist.fm/setlist/artist/year/venue-${gig.setlistId}.html`;
		}

		activeGig.set({
			...gig,
			has_songs: gig.setlistId && gig.setlistId !== 'null',
			url: url,
			full_lineup: gig.artist
		});
	}
</script>

<div class="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-6">
	<div class="max-w-7xl mx-auto space-y-12">
		<!-- Header -->
		<div class="space-y-4 border-b border-zinc-800 pb-8">
			<h1
				class="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-amber-700"
			>
				The Classics
			</h1>
			<p class="text-xl md:text-2xl text-zinc-400 font-serif max-w-2xl leading-relaxed">
				The "Hall of Fame." Five nights that defined the cultural heartbeat of the Potteries.
			</p>
		</div>

		<!-- Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each classicGigs as gig}
				<div
					class="group relative bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-amber-900/20 flex flex-col h-[500px]"
				>
					<!-- Cover / Visual (Placeholder Gradient or Image) -->
					<div class="h-48 bg-zinc-800 relative overflow-hidden">
						<div class="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
						<!-- Placeholder Pattern -->
						<div
							class="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-zinc-900 to-zinc-950"
						></div>
						<h2
							class="absolute bottom-4 left-6 z-20 text-4xl font-black uppercase leading-none tracking-tighter drop-shadow-lg"
						>
							{gig.artist}
						</h2>
					</div>

					<!-- Content -->
					<div class="p-6 flex-1 flex flex-col justify-between">
						<div class="space-y-4">
							<div class="flex justify-between items-start border-b border-zinc-800 pb-4">
								<div>
									<div class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
										{gig.date}
									</div>
									<div class="text-sm font-mono text-zinc-400">{gig.venue}</div>
								</div>
								{#if gig.tour}
									<div
										class="text-[10px] font-bold text-zinc-600 uppercase border border-zinc-800 px-2 py-1 rounded"
									>
										{gig.tour}
									</div>
								{/if}
							</div>

							<div class="space-y-2">
								<h3 class="text-xs font-bold text-zinc-500 uppercase">Why It Matters</h3>
								<p class="text-sm text-zinc-300 leading-relaxed font-serif">
									{gig.description}
								</p>
							</div>
						</div>

						<!-- Action -->
						<button
							onclick={() => openClassicGig(gig)}
							class="w-full mt-6 bg-zinc-950 border border-zinc-800 py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-amber-500 hover:bg-amber-950/30 transition-all flex items-center justify-center gap-2 group-hover:translate-y-0"
						>
							<span>View Setlist & Details</span>
							<svg
								class="w-3 h-3 group-hover:translate-x-1 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								></path></svg
							>
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
