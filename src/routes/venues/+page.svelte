<script>
	import timelineData from '$lib/data/timeline_data.json';
	import { activeGig } from '$lib/stores/modalStore';
	import VenueChart from '$lib/components/VenueChart.svelte';

	// Filter Logic
	const venueConfig = {
		'Golden Torch': {
			color: '#ca8a04',
			capacity: 1200,
			keywords: ['torch'],
			desc: 'The soul of the 70s. A legendary Northern Soul dungeon.'
		},
		'Victoria Hall': {
			color: '#3b82f6',
			capacity: 1600,
			keywords: ['victoria'],
			desc: "The grand dame. Hanley's premier concert hall for decades."
		},
		'Trentham Gardens': {
			color: '#16a34a',
			capacity: 3000,
			keywords: ['trentham'],
			desc: 'The ballroom era. Hosted the giants of rock in its heyday.'
		},
		'The Sugarmill': {
			color: '#9333ea',
			capacity: 400,
			keywords: ['sugarmill'],
			desc: 'Indie grit. The 90s/00s sweatbox where careers were launched.'
		},
		'The Wheatsheaf': {
			color: '#dc2626',
			capacity: 250,
			keywords: ['wheatsheaf'],
			desc: 'Pub rock royalty. The intimate breeding ground for local angst.'
		}
	};

	let venueProfiles = [];

	// Process Data
	const years = [
		...new Set(
			timelineData.map((d) =>
				typeof d.Year === 'number' ? d.Year : new Date(d.DateStr).getFullYear()
			)
		)
	].sort((a, b) => a - b);

	Object.entries(venueConfig).forEach(([name, cfg]) => {
		// Init counts
		const counts = Array(years.length).fill(0);
		const highlights = [];

		timelineData.forEach((row) => {
			const y = typeof row.Year === 'number' ? row.Year : new Date(row.DateStr).getFullYear();
			const yIdx = years.indexOf(y);

			// Check venues in this row
			const rowVenues = Object.keys(row).filter(
				(k) => k !== 'Year' && k !== 'Month' && k !== 'DateStr'
			);

			rowVenues.forEach((vName) => {
				const lowerV = vName.toLowerCase();
				if (cfg.keywords.some((k) => lowerV.includes(k))) {
					// Match!
					if (yIdx !== -1) counts[yIdx] += row[vName].length;

					// Add to potential highlights
					row[vName].forEach((g) => {
						highlights.push({
							...g,
							date: row.DateStr,
							venue: vName,
							year: y
						});
					});
				}
			});
		});

		// Select top 3 highlights
		const top3 = highlights
			.sort((a, b) => {
				if (a.has_songs && !b.has_songs) return -1;
				if (!a.has_songs && b.has_songs) return 1;
				return 0; // maintain order roughly
			})
			.slice(0, 3);

		venueProfiles.push({
			name,
			...cfg,
			counts, // Added for chart
			highlights: top3
		});
	});

	function openGig(gig) {
		let url = gig.url || '';
		activeGig.set({
			...gig,
			has_songs: gig.has_songs,
			url: url,
			full_lineup: gig.artist
		});
	}
</script>

<div class="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-6">
	<div class="max-w-7xl mx-auto space-y-24">
		<!-- Header -->
		<div class="space-y-4 border-b border-zinc-800 pb-8">
			<h1 class="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white">
				The Infrastructure
			</h1>
			<p class="text-xl md:text-2xl text-zinc-400 font-serif max-w-2xl leading-relaxed">
				The rise and fall of the rooms that hosted the noise.
			</p>
		</div>

		<!-- Venue Profiles (Chapters) -->
		<div class="space-y-48">
			{#each venueProfiles as venue}
				<section
					class="grid md:grid-cols-[360px_1fr] gap-12 lg:gap-24 border-t border-zinc-800 pt-12 items-start group"
				>
					<!-- Chapter Head (Sticky) -->
					<div class="sticky top-28 space-y-8">
						<!-- Header -->
						<h3
							class="text-5xl font-black uppercase tracking-tighter leading-none"
							style="color: {venue.color}"
						>
							{venue.name}
						</h3>

						<!-- Data Chart -->
						<div class="border-t border-b border-zinc-800 py-6 bg-zinc-900/20 rounded-lg">
							<div class="flex justify-between items-end mb-2 px-2">
								<span class="text-[10px] uppercase font-bold text-zinc-500 tracking-widest"
									>Activity Pulse</span
								>
								<span class="text-[10px] font-mono text-zinc-600"
									>{years[0]} — {years[years.length - 1]}</span
								>
							</div>
							<VenueChart data={venue.counts} {years} color={venue.color} label={venue.name} />
						</div>

						<!-- Narrative Text Block -->
						<div class="space-y-4">
							<p
								class="text-zinc-300 font-serif text-lg leading-relaxed border-l-2 pl-4"
								style="border-color: {venue.color}40"
							>
								{venue.desc}
							</p>
							<div
								class="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase"
							>
								<span class="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded"
									>Cap: {venue.capacity}</span
								>
								<span class="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded"
									>Total Gigs: {venue.highlights.length}+</span
								>
							</div>
						</div>
					</div>

					<!-- Content / Highlights -->
					<div class="space-y-8">
						<h4
							class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
						>
							Key Archives
						</h4>
						<div class="grid sm:grid-cols-2 gap-4">
							{#each venue.highlights as gig}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-500 transition-all hover:translate-x-1 group/card cursor-pointer"
									onclick={() => openGig(gig)}
								>
									<div class="flex justify-between items-start mb-4">
										<div class="text-[10px] font-bold text-zinc-500 uppercase">{gig.date}</div>
										{#if gig.has_songs}
											<div
												class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]"
											></div>
										{/if}
									</div>
									<h4
										class="text-xl font-bold text-white leading-tight mb-2 group-hover/card:text-amber-500 transition-colors"
									>
										{gig.artist}
									</h4>
									<div
										class="mt-4 pt-4 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono flex justify-between"
									>
										<span>VIEW RECORD</span>
										<span class="opacity-0 group-hover/card:opacity-100 transition-opacity">→</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>
			{/each}
		</div>
	</div>
</div>
