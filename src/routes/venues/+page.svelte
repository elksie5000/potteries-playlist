<script>
	import timelineData from '$lib/data/timeline_data.json';
	import { activeGig } from '$lib/stores/modalStore';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

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

	let chartData = {
		labels: [],
		datasets: []
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
	chartData.labels = years;

	Object.entries(venueConfig).forEach(([name, cfg]) => {
		// Init counts
		const counts = Array(years.length).fill(0);
		const highlights = [];

		timelineData.forEach((row) => {
			const y = typeof row.Year === 'number' ? row.Year : new Date(row.DateStr).getFullYear();
			const yIdx = years.indexOf(y);

			// Check venues in this row
			// row has keys: Year, Month, DateStr, and venues...
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
						// Add context for the card
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

		// Dataset
		chartData.datasets.push({
			label: name,
			data: counts,
			borderColor: cfg.color,
			backgroundColor: cfg.color,
			tension: 0.4,
			borderWidth: 2,
			pointRadius: 0
		});

		// Select top 3 highlights (prioritize ones with songs/url)
		const top3 = highlights
			.sort((a, b) => {
				if (a.has_songs && !b.has_songs) return -1;
				if (!a.has_songs && b.has_songs) return 1;
				return 0; // maintain order roughly (chronological usually)
			})
			.slice(0, 3);

		venueProfiles.push({
			name,
			...cfg,
			highlights: top3
		});
	});

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom',
				labels: { color: '#71717a', font: { family: 'monospace' } }
			},
			title: { display: false }
		},
		scales: {
			x: {
				grid: { color: '#27272a' },
				ticks: { color: '#71717a', font: { family: 'monospace' } }
			},
			y: {
				grid: { color: '#27272a' },
				ticks: { color: '#71717a' }
			}
		}
	};

	let canvas;
	let chartInstance;

	onMount(() => {
		if (canvas) {
			chartInstance = new Chart(canvas, {
				type: 'line',
				data: chartData,
				options: chartOptions
			});
		}
		return () => {
			if (chartInstance) chartInstance.destroy();
		};
	});

	function openGig(gig) {
		// Adapt for modal
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
	<div class="max-w-7xl mx-auto space-y-16">
		<!-- Header -->
		<div class="space-y-4 border-b border-zinc-800 pb-8">
			<h1 class="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white">
				The Infrastructure
			</h1>
			<p class="text-xl md:text-2xl text-zinc-400 font-serif max-w-2xl leading-relaxed">
				The rise and fall of the rooms that hosted the noise.
			</p>
		</div>

		<!-- Chart Section -->
		<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-12 shadow-2xl">
			<h2 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">
				Gig Frequency (1965–2010)
			</h2>
			<div class="h-[300px] md:h-[400px] w-full relative">
				<canvas bind:this={canvas}></canvas>
			</div>
		</div>

		<!-- Venue Profiles -->
		<div class="space-y-24">
			{#each venueProfiles as venue}
				<div
					class="grid md:grid-cols-[300px_1fr] gap-12 border-t border-zinc-800 pt-12 items-start"
				>
					<!-- Info -->
					<div class="sticky top-24 space-y-6">
						<h3 class="text-4xl font-black uppercase tracking-tighter" style="color: {venue.color}">
							{venue.name}
						</h3>
						<div class="space-y-2">
							<p class="text-zinc-300 font-serif text-lg leading-relaxed">{venue.desc}</p>
							<div class="flex items-center gap-4 text-xs font-mono text-zinc-500 mt-4">
								<span class="border border-zinc-800 px-2 py-1 rounded">CAP: {venue.capacity}</span>
								<span class="border border-zinc-800 px-2 py-1 rounded"
									>DATA POINTS: {venue.highlights.length}+</span
								>
							</div>
						</div>
					</div>

					<!-- Highlight Cards -->
					<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each venue.highlights as gig}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition-colors group cursor-pointer"
								onclick={() => openGig(gig)}
							>
								<div class="text-[10px] font-bold text-zinc-500 uppercase mb-2">{gig.date}</div>
								<h4
									class="text-lg font-bold text-white leading-tight mb-2 group-hover:text-amber-500 transition-colors"
								>
									{gig.artist}
								</h4>
								{#if gig.has_songs}
									<div
										class="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded"
									>
										<span>● Setlist</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
