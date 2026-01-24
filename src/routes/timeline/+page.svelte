<script>
	import TimelineGrid from '$lib/components/TimelineGrid.svelte';
	import { openGig } from '$lib/stores/modalStore';
	import timelineData from '$lib/data/timeline_data.json';

	// Transform data for the grid
	// 1. Get Venues
	const venueSet = new Set();
	timelineData.forEach((row) => {
		Object.keys(row).forEach((k) => {
			if (k !== 'Year' && k !== 'Month' && k !== 'DateStr') {
				venueSet.add(k);
			}
		});
	});
	const uniqueVenues = Array.from(venueSet).sort();
	const venueData = uniqueVenues.map((v) => ({ id: v, name: v }));

	// 2. Group by Year/Month
	let gridTimeline = $derived.by(() => {
		const rows = [];
		const groupedData = {}; // "1965-1" -> [row, row]

		timelineData.forEach((row) => {
			const y = typeof row.Year === 'number' ? row.Year : new Date(row.DateStr).getFullYear();
			const d = new Date(row.DateStr);
			const m = isNaN(d) ? 1 : d.getMonth() + 1;
			const key = `${y}-${m}`;
			if (!groupedData[key]) groupedData[key] = [];
			groupedData[key].push(row);
		});

		const years = Object.keys(groupedData)
			.map((k) => parseInt(k.split('-')[0]))
			.sort((a, b) => a - b);
		if (years.length === 0) return [];

		const minYear = years[0];
		const maxYear = years[years.length - 1];

		for (let y = minYear; y <= maxYear; y++) {
			for (let m = 1; m <= 12; m++) {
				const key = `${y}-${m}`;
				const timeRows = groupedData[key];

				if (timeRows) {
					const entryRow = { year: y, month: m, entries: {} };

					// For each venue, aggregate gigs
					venueData.forEach((v) => {
						let venuesGigs = [];
						timeRows.forEach((row) => {
							if (row[v.id]) {
								venuesGigs = venuesGigs.concat(row[v.id]);
							}
						});

						if (venuesGigs.length > 0) {
							// Ensure gig objects have necessary fields
							entryRow.entries[v.id] = venuesGigs.map((g) => ({
								...g,
								date:
									g.date ||
									timeRows.find((tr) => tr[v.id] && tr[v.id].includes(g))?.DateStr ||
									`${y}-${m}-01`
							}));
						}
					});

					if (Object.keys(entryRow.entries).length > 0) {
						rows.push(entryRow);
					}
				}
			}
		}
		return rows;
	});

	function handleYearChange(y) {
		// Auto-scroll or sync
	}

	function handleVenueHover(vId) {
		// Highlight logic
	}

	// Modal handler passed to grid?
	// The grid emits click or we can handle it if we passed a slot/callback.
	// Looking at TimelineGrid.svelte, it does: onclick={() => openGig(gig)}?
	// Ah, TimelineGrid.svelte uses `dispatch` or generic `onclick`?
	// Let's check TimelineGrid source code I modified.
	// It has: `onclick={() => openGig(gig)}` in the markup??
	// Wait, in my previous view of TimelineGrid (Step 8), it had `onclick={() => openGig(gig)}`.
	// But does it import openGig?
	// In Step 8 view, line 101, it calls `openGig(gig)`.
	// BUT `openGig` was NOT defined in the script in Step 8!
	// Use grep to check.
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 pt-20">
	<div class="px-6 pb-6 border-b border-zinc-900 mb-0">
		<h1 class="text-4xl font-black text-white uppercase tracking-tighter">The Grid</h1>
		<p class="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">
			Chronological Overview
		</p>
	</div>
	<TimelineGrid
		venues={venueData}
		timeline={gridTimeline}
		onYearChange={handleYearChange}
		onVenueHover={handleVenueHover}
	/>
</div>
