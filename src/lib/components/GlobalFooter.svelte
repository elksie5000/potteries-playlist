<script>
	let shareText = 'Check out this baby name visualizer!';
	let copied = false;

	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Stoke Music Data',
					text: shareText,
					url: window.location.href
				});
			} catch (err) {
				console.error('Share failed:', err);
			}
		} else {
			try {
				await navigator.clipboard.writeText(window.location.href);
				copied = true;
				setTimeout(() => (copied = false), 2000);
			} catch (err) {
				console.error('Clipboard failed', err);
			}
		}
	}
</script>

<footer
	class="fixed bottom-0 left-0 right-0 h-10 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-between px-4 text-white font-sans border-t border-slate-700/50"
>
	<!-- Left: Link -->
	<a
		href="https://portfolio-three-livid-76.vercel.app/"
		class="text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
	>
		<span>←</span> View All Doodles
	</a>

	<!-- Center: Credits -->
	<div
		class="absolute left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-slate-400 font-light tracking-wide whitespace-nowrap"
	>
		Designed & Built by <span class="text-slate-200 font-medium">David Elks</span>
	</div>

	<!-- Right: Share -->
	<button
		onclick={share}
		class="text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded hover:bg-slate-700"
	>
		{#if copied}
			<span>Copied!</span>
		{:else}
			<span>Share</span>
			<span class="text-[10px] opacity-70">↗</span>
		{/if}
	</button>
</footer>

<style>
	/* Fallback styles in case Tailwind isn't fully loading yet, though outline classes are preferred */
</style>
