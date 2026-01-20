<script>
	import { stokeVenues } from '$lib/config/music-config';

	// Hardcoded for 'The Place' and 'Harold Clowes' legacy
	// We display a simple dual-venue narrative here.
	const venues = stokeVenues.filter((v) => v.id === 'the-place' || v.id === 'harold-clowes');
</script>

<div class="min-h-screen bg-zinc-900 text-zinc-100 p-8 font-sans">
	<header class="text-center mb-16 space-y-4">
		<h1 class="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase">
			The 'n Betweens Legacy
		</h1>
		<p class="text-2xl text-zinc-400 font-serif italic">From Mod to Glam: 1965-1966</p>
	</header>

	<div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
		<div class="bg-zinc-950 p-8 border border-zinc-800 rounded-xl space-y-4">
			<h2 class="text-3xl font-bold text-[#00ff9d]">Harold Clowes Hall</h2>
			<p class="text-zinc-400 leading-relaxed">
				Before they were <span class="font-bold text-white">Slade</span>, they were the
				<span class="font-bold text-white">'n Betweens</span>. Regulars at this community hub, they
				forged the sound that would eventually conquer the 70s charts.
			</p>
			<div class="mt-4 p-4 bg-zinc-900 rounded border border-zinc-800">
				<p class="text-sm font-mono text-zinc-500">VENUE ID: harold-clowes</p>
				<p class="text-sm font-mono text-zinc-500">LAT: 53.012, LNG: -2.155</p>
			</div>
		</div>

		<div class="bg-zinc-950 p-8 border border-zinc-800 rounded-xl space-y-4">
			<h2 class="text-3xl font-bold text-[#00ccff]">The Place</h2>
			<p class="text-zinc-400 leading-relaxed">
				The premier club of the era. Where the transition cemented itself. A boiler room of sweat,
				soul, and volume.
			</p>
			<div class="mt-4 p-4 bg-zinc-900 rounded border border-zinc-800">
				<p class="text-sm font-mono text-zinc-500">VENUE ID: the-place</p>
				<p class="text-sm font-mono text-zinc-500">LAT: 53.025, LNG: -2.176</p>
			</div>
		</div>
	</div>

	<div class="text-center mt-16">
		<a
			href="/"
			class="inline-block px-8 py-3 border border-zinc-700 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors uppercase tracking-widest text-sm"
		>
			← Return to Eras
		</a>
	</div>
</div>
