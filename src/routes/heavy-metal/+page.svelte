<script lang="ts">
	import LeafletMap from '$lib/components/LeafletMap.svelte';

	let { data } = $props();
	let { venue, gigs } = data;
</script>

<div
	class="min-h-screen bg-black text-white font-mono selection:bg-yellow-400 selection:text-black"
>
	<!-- Kerrang! Header -->
	<header class="border-b-8 border-yellow-400 p-8 text-center bg-black relative overflow-hidden">
		<div
			class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-50"
		></div>
		<h1
			class="text-6xl md:text-8xl font-black text-yellow-400 uppercase tracking-tighter transform -rotate-2 relative z-10 drop-shadow-[4px_4px_0_rgba(255,255,255,1)]"
		>
			HEAVY METAL<br />HOLOCAUST
		</h1>
		<p
			class="text-2xl font-bold bg-white text-black inline-block px-4 py-1 mt-4 transform rotate-1"
		>
			PORT VALE STADIUM // 1981
		</p>
	</header>

	<div class="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
		<!-- Column 1: The Narrative -->
		<div class="space-y-8">
			<div
				class="bg-zinc-900 border-4 border-white p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300"
			>
				<h2 class="text-3xl font-black text-yellow-400 mb-4 border-b-4 border-yellow-400 pb-2">
					THE INCIDENT
				</h2>
				<p class="text-lg leading-relaxed font-bold text-zinc-300">
					<span class="bg-yellow-400 text-black px-1">Black Sabbath</span> were billed to headline. Stoke
					held its breath. Then came the dropout.
				</p>
				<p class="text-lg leading-relaxed mt-4 text-zinc-300">
					Enter <span class="text-white font-black">Ozzy Osbourne</span>. The Prince of Darkness
					returned to the Potteries to confront his former bandmates' ghost on the very same stage.
					History wasn't just made; it was shredded.
				</p>
			</div>

			<div class="space-y-4">
				{#each gigs as gig}
					<div
						class="bg-zinc-900 border-l-8 border-yellow-400 p-6 flex justify-between items-center group hover:bg-zinc-800 transition-colors"
					>
						<div>
							<h3
								class="text-4xl font-black text-white uppercase group-hover:text-yellow-400 transition-colors"
							>
								{gig.artist}
							</h3>
							<p class="text-zinc-500 font-bold mt-1">{gig.specialNote}</p>
						</div>
						<a
							href={gig.url}
							class="bg-white text-black font-black px-4 py-2 hover:bg-yellow-400 transition-colors uppercase text-sm"
						>
							SETLIST
						</a>
					</div>
				{/each}
			</div>
		</div>

		<!-- Column 2: The Map -->
		<div class="relative border-4 border-white h-[600px] shadow-[8px_8px_0_#facc15]">
			<LeafletMap {venue} />

			<div
				class="absolute top-4 right-4 z-[9999] bg-yellow-400 text-black p-4 font-black text-xl border-4 border-black transform rotate-3 text-center shadow-xl"
			>
				WARNING:<br />135,000 DECIBELS
			</div>
		</div>
	</div>

	<!-- Lemmy Tribute Footer -->
	<footer class="mt-12 border-t-8 border-zinc-800 bg-zinc-900 p-12 text-center">
		<h3 class="text-3xl font-black text-zinc-700 uppercase mb-4">
			"Lemmy was born 2 miles from this venue"
		</h3>
		<p class="text-zinc-500 font-serif italic max-w-xl mx-auto">
			(Burslem, Stoke-on-Trent. The Motorhead frontman's spiritual home.)
		</p>
	</footer>
</div>

<style>
	/* Rough, xeroxed aesthetic */
	:global(body) {
		background: #000;
	}
</style>
