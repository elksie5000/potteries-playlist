<script>
	let { data } = $props();

	const width = 1200;
	const height = 400;
	const padding = 40;

	// 1. Data Processing
	// Get range
	const years = [...new Set(data.archive.map((g) => g.year))].sort((a, b) => a - b);
	const minYear = years[0] || 1965;
	const maxYear = years[years.length - 1] || 2010;
	const venues = [...new Set(data.archive.map((g) => g.venue))];

	// Aggregation
	// Structure: { venueName: [ {year, count}, ... ] }
	const series = {};
	venues.forEach((v) => {
		series[v] = years.map((y) => ({ year: y, count: 0 }));
	});

	data.archive.forEach((gig) => {
		const s = series[gig.venue];
		if (s) {
			const entry = s.find((d) => d.year === gig.year);
			if (entry) entry.count++;
		}
	});

	// Find Max Count for Y-Scale
	let maxCount = 0;
	Object.values(series).forEach((arr) => {
		arr.forEach((d) => {
			if (d.count > maxCount) maxCount = d.count;
		});
	});

	// Color Palette
	const colors = [
		'#f59e0b', // Amber (Torch)
		'#10b981', // Emerald (Places)
		'#3b82f6', // Blue (Victoria)
		'#8b5cf6', // Violet (Sugarmill)
		'#ef4444', // Red (Wheatsheaf)
		'#ec4899', // Pink (Shelleys)
		'#6366f1', // Indigo (Trentham)
		'#14b8a6', // Teal
		'#f97316' // Orange
	];

	// Scales
	const xScale = (y) => padding + ((y - minYear) / (maxYear - minYear)) * (width - padding * 2);
	const yScale = (c) => height - padding - (c / maxCount) * (height - padding * 2);

	// Path Generator
	function makePath(points) {
		return 'M' + points.map((p) => `${xScale(p.year)},${yScale(p.count)}`).join(' L');
	}

	// Active tooltip logic
	let hoverYear = $state(null);
	let coords = $state({ x: 0, y: 0 });

	function handleMove(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const boundedX = Math.max(padding, Math.min(x, width - padding));
		const ratio = (boundedX - padding) / (width - padding * 2);
		const yRaw = minYear + ratio * (maxYear - minYear);
		hoverYear = Math.round(yRaw);
		coords = { x: xScale(hoverYear), y: e.clientY - rect.top }; // approximate
	}
</script>

<div class="min-h-screen bg-zinc-950 p-8 text-zinc-300">
	<h1 class="text-3xl font-black text-white uppercase tracking-tighter mb-8">
		The Pulse <span class="text-zinc-600">Analytics</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-6 items-start">
		<!-- Chart Container -->
		<div
			class="relative flex-1 w-full border border-zinc-800 bg-zinc-900/40 rounded-xl p-4 shadow-2xl overflow-hidden cursor-crosshair group"
		>
			<svg
				{width}
				{height}
				class="w-full h-auto"
				onmousemove={handleMove}
				onmouseleave={() => (hoverYear = null)}
				role="img"
				aria-label="Line chart showing gig frequency over time"
			>
				<!-- Reuse Grid, Axis, Lines, Tooltip Line -->
				{#each [0, 0.25, 0.5, 0.75, 1] as t}
					{@const val = Math.round(maxCount * t)}
					{@const y = yScale(val)}
					<line
						x1={padding}
						x2={width - padding}
						y1={y}
						y2={y}
						stroke="#333"
						stroke-dasharray="4"
					/>
					<text x={padding - 10} y={y + 4} text-anchor="end" font-size="10" fill="#666">{val}</text>
				{/each}

				{#each years.filter((y) => y % 5 === 0) as y}
					<text x={xScale(y)} y={height - 20} text-anchor="middle" font-size="10" fill="#888"
						>{y}</text
					>
					<line
						x1={xScale(y)}
						x2={xScale(y)}
						y1={height - padding}
						y2={height - padding + 5}
						stroke="#555"
					/>
				{/each}

				{#each Object.entries(series) as [venue, points], i}
					<path
						d={makePath(points)}
						fill="none"
						stroke={colors[i % colors.length]}
						stroke-width="2"
						stroke-opacity="0.8"
						class="transition-all duration-300 hover:stroke-width-4 hover:stroke-opacity-100"
					/>
				{/each}

				{#if hoverYear}
					<line
						x1={xScale(hoverYear)}
						x2={xScale(hoverYear)}
						y1={padding}
						y2={height - padding}
						stroke="white"
						stroke-width="1"
						stroke-dasharray="2"
					/>
					<!-- Dots -->
					{#each Object.entries(series) as [venue, points], i}
						{@const pt = points.find((p) => p.year === hoverYear)}
						{#if pt}
							<circle
								cx={xScale(hoverYear)}
								cy={yScale(pt.count)}
								r="4"
								fill={colors[i % colors.length]}
								stroke="black"
							/>
						{/if}
					{/each}
				{/if}
			</svg>

			<!-- Floating Tooltip -->
			{#if hoverYear}
				<div
					class="absolute pointer-events-none z-50 bg-zinc-950/95 border border-zinc-700 p-3 rounded shadow-2xl text-xs min-w-[160px] backdrop-blur"
					style="top: {coords.y}px; left: {coords.x}px; transform: translate(10px, 10px);"
				>
					<div class="text-xl font-black text-white border-b border-zinc-800 pb-2 mb-2">
						{hoverYear}
					</div>
					{#each Object.entries(series)
						.map(([venue, points], i) => {
							const pt = points.find((p) => p.year === hoverYear);
							return { venue, count: pt ? pt.count : 0, color: colors[i % colors.length] };
						})
						.filter((x) => x.count > 0)
						.sort((a, b) => b.count - a.count) as item}
						<div class="flex justify-between items-center gap-4 mb-1.5">
							<span class="flex items-center gap-2 overflow-hidden">
								<span class="w-2 h-2 rounded-full shrink-0" style="background: {item.color}"></span>
								<span class="text-zinc-400 truncate max-w-[120px]">{item.venue}</span>
							</span>
							<span class="font-bold text-white font-mono">{item.count}</span>
						</div>
					{/each}
					{#if Object.entries(series).every(([, pts]) => !pts.find((p) => p.year === hoverYear)?.count)}
						<div class="text-zinc-600 italic text-center">No Activity</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Sidebar Legend -->
		<div
			class="w-full lg:w-64 shrink-0 flex flex-col gap-3 p-5 bg-zinc-900/30 rounded-xl border border-zinc-800 h-fit self-start sticky top-8"
		>
			<h3
				class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 border-b border-zinc-800 pb-2"
			>
				Venue Key
			</h3>
			<div class="space-y-2">
				{#each venues as v, i}
					<div class="flex items-center gap-3 text-xs font-mono group cursor-default">
						<span
							class="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
							style="background: {colors[i % colors.length]}"
						></span>
						<span class="text-zinc-400 group-hover:text-zinc-200 transition-colors">{v}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
