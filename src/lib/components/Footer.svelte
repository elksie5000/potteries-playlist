<script>
	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-zinc-950 border-t border-zinc-900 py-12 px-6">
	<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
		<!-- Branding -->
		<div>
			<h4 class="text-zinc-100 font-black uppercase tracking-tighter text-xl mb-2">
				Potteries Playlist
			</h4>
			<p class="text-zinc-500 font-mono text-xs max-w-sm">
				A living archive of the Stoke-on-Trent music scene. Documenting the noise from 1965 to
				Present.
			</p>
		</div>

		<!-- Disclaimers -->
		<div class="text-right">
			<div class="flex flex-col gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
				<p>Data provided by user submissions to Setlist.fm & Wikipedia.</p>
				<p>
					Not affiliated with any venue or artist. <br />
					Content is for educational and archival purposes only.
				</p>
			</div>
			<div class="mt-4 text-zinc-700 text-[10px] font-mono">
				© {currentYear} Potteries Playlist. Built with Svelte 5.
			</div>
		</div>
	</div>
</footer>
