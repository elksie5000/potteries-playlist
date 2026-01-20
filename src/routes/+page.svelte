<script lang="ts">
	import TimelineGrid from '$lib/components/TimelineGrid.svelte';
	import NarrativeSidebar from '$lib/components/NarrativeSidebar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();
	let { venues, timeline } = data;

	let currentYear = $state(1970);
	let activeVenueId = $state<string | null>(null);

	// Derived color based on year for the "Atmosphere"
	let bgGradient = $derived.by(() => {
		if (currentYear < 1970) return 'from-zinc-900 to-zinc-800';
		if (currentYear < 1980) return 'from-orange-900/20 to-amber-900/20'; // Soul/Rock
		if (currentYear < 1990) return 'from-pink-900/20 to-purple-900/20'; // Synth
		if (currentYear < 2000) return 'from-green-900/20 to-blue-900/20'; // Rave
		return 'from-indigo-900/20 to-cyan-900/20'; // Indie
	});

	function handleYearChange(y) {
		currentYear = y;
	}

	function handleVenueHover(vId) {
		activeVenueId = vId;
	}
</script>

<div
	class={`min-h-screen bg-zinc-950 transition-colors duration-1000 bg-gradient-to-br ${bgGradient} fixed inset-0 -z-50`}
></div>

<Navbar />

<div class="flex h-screen overflow-hidden pt-16">
	<!-- Center: Timeline (Expanded, was w-1/2, now w-3/4 for breathing room) -->
	<div class="flex-1 h-full overflow-y-auto w-full lg:w-3/4 bg-zinc-950/50">
		<div class="max-w-6xl mx-auto min-h-[300vh]">
			<div class="py-12 px-6 text-center">
				<h1 class="text-4xl font-black text-white uppercase tracking-tighter mb-4">
					Potteries Playlist <span class="text-zinc-600">Archive</span>
				</h1>
				<p class="text-zinc-500 font-mono text-sm">SCROLL TO EXPLORE 1965-2010</p>
				<div class="mt-4 animate-bounce text-zinc-500">↓</div>
			</div>

			<TimelineGrid
				{venues}
				{timeline}
				{activeVenueId}
				onYearChange={handleYearChange}
				onVenueHover={handleVenueHover}
			/>

			<div class="py-24 text-center text-zinc-600 font-mono text-xs">END OF ARCHIVE</div>
		</div>
	</div>

	<!-- Right: Narrative (Fixed) -->
	<div class="hidden lg:block w-1/4 h-full bg-zinc-950 border-l border-zinc-800">
		<NarrativeSidebar {currentYear} />
	</div>
</div>

<style>
	div::-webkit-scrollbar {
		width: 8px;
		background: #09090b;
	}
	div::-webkit-scrollbar-thumb {
		background: #27272a;
		border-radius: 4px;
	}
</style>
