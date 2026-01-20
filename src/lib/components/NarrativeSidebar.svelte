<script>
	export let currentYear = 1970;

	// Narrative content keyed by Era/Year ranges
	// In a real app, this could come from a CMS
	const narratives = [
		{
			start: 1960,
			end: 1969,
			title: 'The Mod Era',
			text: "Sweaty basements. The Place. The 'n Betweens finding their feet."
		},
		{
			start: 1970,
			end: 1979,
			title: 'Soul & Rock',
			text: 'The Golden Torch lights up Tunstall. Trentham Gardens hosts the gods of Rock.'
		},
		{
			start: 1980,
			end: 1989,
			title: 'Synth & Decline',
			text: 'Victoria Hall echoes with new wave. The industry fades, but the volume stays high.'
		},
		{
			start: 1990,
			end: 1999,
			title: 'Rave & Britpop',
			text: 'Shelleys Laserdrome puts Stoke on the global dance map. Oasis play the Wheatsheaf.'
		},
		{
			start: 2000,
			end: 2010,
			title: 'Indie Renaissance',
			text: 'The Sugarmill rises. A new generation finds its voice in Hanley.'
		}
	];

	$: currentEra =
		narratives.find((n) => currentYear >= n.start && currentYear <= n.end) || narratives[0];
</script>

<div
	class="p-6 sticky top-20 border-l border-zinc-800 bg-zinc-950/80 backdrop-blur-md min-h-[50vh] flex flex-col justify-center"
>
	<div class="space-y-4 transition-all duration-500">
		<h2
			class="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2"
		>
			Historic Context
		</h2>

		<div class="space-y-2">
			<h1
				class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400"
			>
				{currentEra.title}
			</h1>
			<p class="text-lg text-zinc-400 leading-relaxed font-serif italic text-pretty">
				"{currentEra.text}"
			</p>
		</div>

		<div class="pt-8 grid grid-cols-2 gap-4 opacity-50">
			<div>
				<span class="block text-2xl font-mono text-zinc-600 font-bold">{currentYear}</span>
				<span class="text-xs text-zinc-600 uppercase">Current Year</span>
			</div>
		</div>
	</div>
</div>
