<script>
	import { classicGigs } from '$lib/data/classics';
</script>

<div
	class="min-h-screen bg-zinc-950 text-zinc-300 p-6 md:p-12 font-mono selection:bg-amber-500 selection:text-black"
>
	<section class="max-w-3xl mx-auto mb-20 border-l-4 border-amber-500 pl-6 md:pl-12 py-2">
		<h1
			class="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]"
		>
			The Lost <br /> <span class="text-amber-500">Tapes</span>
		</h1>

		<div class="prose prose-invert prose-lg text-zinc-400 space-y-6">
			<p>
				This project began in the silence following January 10, 2016. The death of <strong
					class="text-white">David Bowie</strong
				>
				didn’t just stop the music; it triggered a forensic audit of memory. Amid the global
				tributes, a local fact resurfaced: the Starman had walked among us. He played
				<span class="text-white bg-zinc-900 px-1">Victoria Hall</span> in 1973, at the absolute zenith
				of Glam Rock.
			</p>
			<p>
				It raised a question: <em>Who else?</em>
			</p>
			<p>
				The answer lay buried in the <a
					href="https://www.setlist.fm"
					target="_blank"
					class="text-amber-500 hover:underline">setlist.fm</a
				> database. Over 2,500 gigs. A timeline that proves Stoke-on-Trent wasn't just a flyover state
				for rock and roll—it was a crucible.
			</p>
			<p>
				From the sweaty walls of <strong class="text-white">The Golden Torch</strong> in Tunstall
				where Northern Soul found its feet, to <strong class="text-white">The Place</strong> in
				Hanley hosting The Who. We hosted the chaos of the
				<strong class="text-white">Sex Pistols</strong>
				era (often misremembered, but never forgotten) and the anthems of
				<strong class="text-white">Oasis</strong>
				at the Wheatsheaf on the very day they released <em>Supersonic</em>.
			</p>
			<p>This is not nostalgia. It is evidence.</p>
		</div>
	</section>

	<section class="max-w-6xl mx-auto mb-20">
		<h2
			class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-2"
		>
			Key Evidence (Featured Gigs)
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each classicGigs as gig}
				<div
					class="group border border-zinc-800 bg-zinc-900/20 p-6 hover:border-amber-500/50 hover:bg-zinc-900/50 transition-all duration-300"
				>
					<div class="flex justify-between items-start mb-4">
						<span class="text-amber-500 font-bold text-sm tracking-tight">{gig.date}</span>
						<div class="flex gap-1">
							{#each gig.tags as tag}
								<span
									class="text-[9px] uppercase border border-zinc-700 px-1 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-400"
									>{tag}</span
								>
							{/each}
						</div>
					</div>
					<h3 class="text-2xl font-black text-white uppercase tracking-tighter mb-1">
						{gig.artist}
					</h3>
					<div class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
						{gig.venue}
					</div>
					<p
						class="text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4 group-hover:border-zinc-700"
					>
						{gig.notes}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="max-w-3xl mx-auto">
		<h2
			class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-2"
		>
			The Geography
		</h2>
		<div class="space-y-8">
			<div class="pl-4 border-l-2 border-zinc-800 hover:border-amber-500 transition-colors">
				<h3 class="text-white font-bold uppercase mb-1">The Golden Torch (Tunstall)</h3>
				<p class="text-sm text-zinc-400">
					The spiritual home of Northern Soul. Before Wigan Casino, there was The Torch.
					All-nighters that ran on sweat, talcum powder, and rare vinyl imports. Closed by the
					council in '73, but never extinguished.
				</p>
			</div>
			<div class="pl-4 border-l-2 border-zinc-800 hover:border-purple-500 transition-colors">
				<h3 class="text-white font-bold uppercase mb-1">Victoria Hall (Hanley)</h3>
				<p class="text-sm text-zinc-400">
					The Grand Dame. Built for acoustics, tested by volume. From Bowie to The Stones, this is
					where the heavyweights played when they needed a room that commanded respect.
				</p>
			</div>
			<div class="pl-4 border-l-2 border-zinc-800 hover:border-emerald-500 transition-colors">
				<h3 class="text-white font-bold uppercase mb-1">The Sugarmill</h3>
				<p class="text-sm text-zinc-400">
					The survivor. A roof terrace, a sticky floor, and a stage that has launched a thousand
					indie careers. If a band broke in the UK between 1995 and today, they played here first.
				</p>
			</div>
		</div>
	</section>

	<footer
		class="mt-20 pt-10 border-t border-zinc-900 text-center text-zinc-600 text-xs uppercase tracking-widest"
	>
		Potteries Playlist &copy; 2026
	</footer>
</div>
