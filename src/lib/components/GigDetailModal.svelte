<script>
	import { activeGig, closeGig } from '$lib/stores/modalStore';

	let setlistData = $state(null);
	let loading = $state(false);
	let error = $state(null);

	$effect(() => {
		if ($activeGig && $activeGig.url) {
			error = null;
			setlistData = null;
			loading = false;

			if ($activeGig.has_songs) {
				loading = true;
				// Extract ID from URL: e.g. .../artist-location-id.html
				const parts = $activeGig.url.split('-');
				let id = parts[parts.length - 1];
				if (id.endsWith('.html')) id = id.slice(0, -5);

				fetch(`/api/setlist?id=${id}`)
					.then(async (r) => {
						if (!r.ok) throw new Error('Failed to retrieve');
						return r.json();
					})
					.then((d) => {
						setlistData = d;
						loading = false;
					})
					.catch((e) => {
						console.error(e);
						error = 'Could not load setlist details.';
						loading = false;
					});
			}
		} else {
			setlistData = null;
			error = null;
			loading = false;
		}
	});
</script>

{#if $activeGig}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
		onclick={closeGig}
	>
		<div
			class="bg-zinc-900 border border-zinc-700 w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="bg-zinc-950 p-6 border-b border-zinc-800 relative shrink-0">
				<div
					class="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black leading-none select-none pointer-events-none"
				>
					{$activeGig.decade}
				</div>

				<h3 class="text-amber-500 font-mono text-xs uppercase tracking-widest mb-2">
					{$activeGig.date} • {$activeGig.venue}
				</h3>
				<h2 class="text-3xl font-black text-white leading-tight mb-2">
					{$activeGig.artist}
				</h2>

				{#if $activeGig.full_lineup && $activeGig.full_lineup !== $activeGig.artist}
					<p class="text-zinc-500 text-xs mt-2">Full Lineup: {$activeGig.full_lineup}</p>
				{/if}
			</div>

			<!-- Scrollable Body -->
			<div class="p-6 space-y-6 overflow-y-auto">
				<!-- Setlist Section -->
				<div class="space-y-3">
					<h4
						class="text-xs font-bold text-zinc-400 uppercase tracking-wide border-b border-zinc-800 pb-1"
					>
						Setlist
					</h4>

					<!-- Always show External Link if URL exists -->
					{#if $activeGig.url}
						<a
							href={$activeGig.url}
							target="_blank"
							class="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase text-amber-500 hover:text-white transition-colors border border-amber-500/20 bg-amber-500/10 px-3 py-2 rounded-lg w-full justify-center hover:bg-amber-600 hover:border-amber-600"
						>
							<span>Open on Setlist.fm</span>
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								></path></svg
							>
						</a>
					{/if}

					{#if loading}
						<div class="animate-pulse flex space-x-4 p-4 border border-zinc-800 rounded">
							<div class="flex-1 space-y-2 py-1">
								<div class="h-2 bg-zinc-800 rounded"></div>
								<div class="h-2 bg-zinc-800 rounded w-5/6"></div>
								<div class="h-2 bg-zinc-800 rounded w-4/6"></div>
							</div>
						</div>
					{:else if error}
						<p class="text-xs text-red-500 italic">{error}</p>
					{:else if setlistData && setlistData.sets && setlistData.sets.set}
						<div class="space-y-4">
							{#each setlistData.sets.set as set}
								<div>
									{#if set.name || set.encore}
										<h5 class="text-[10px] text-zinc-500 uppercase font-bold mb-1 opacity-70">
											{set.encore ? `Encore ${set.encore}` : set.name}
										</h5>
									{/if}

									{#if set.song && set.song.length > 0}
										<ol class="list-decimal list-outside ml-4 space-y-1">
											{#each set.song as song}
												<li class="pl-2 text-sm text-zinc-300 font-mono leading-relaxed">
													<span class="text-zinc-200">{song.name}</span>
													{#if song.cover}
														<span class="text-[10px] text-zinc-500 ml-1 italic"
															>({song.cover.name} cover)</span
														>
													{/if}
													{#if song.info}
														<span class="text-[10px] text-zinc-600 ml-1">[{song.info}]</span>
													{/if}
												</li>
											{/each}
										</ol>
									{/if}
								</div>
							{/each}

							{#if !setlistData.sets.set.length && $activeGig.has_songs}
								<p class="text-sm text-zinc-500 italic">No songs found in API response.</p>
							{/if}
						</div>
					{:else if !$activeGig.has_songs}
						<p class="text-sm text-zinc-600 italic font-mono">
							Setlist processing unavailable. Check source link.
						</p>
					{/if}
				</div>
			</div>

			<!-- Footer Actions -->
			<div
				class="bg-zinc-950 p-4 flex justify-between items-center border-t border-zinc-800 shrink-0"
			>
				<button
					class="text-zinc-500 hover:text-white text-xs uppercase font-bold transition-colors"
					onclick={closeGig}>Close Record</button
				>
				<span class="text-zinc-700 text-[10px] font-mono">ID: {$activeGig.id}</span>
			</div>
		</div>
	</div>
{/if}
