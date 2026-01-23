<script>
	import { activeGig, closeGig } from '$lib/stores/modalStore';
	import { fly } from 'svelte/transition';

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
	<div class="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
			onclick={closeGig}
		></div>

		<!-- Sidecar Panel -->
		<div
			class="relative w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-out"
			transition:fly={{ x: 600, duration: 400 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="bg-zinc-950 p-6 md:p-8 border-b border-zinc-800 relative shrink-0 z-10">
				<!-- Close Button -->
				<button
					class="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors z-50"
					onclick={closeGig}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div
					class="absolute top-0 right-12 p-4 opacity-10 text-[8rem] font-black leading-none select-none pointer-events-none"
				>
					{$activeGig.decade}
				</div>

				<h3 class="text-amber-500 font-mono text-xs uppercase tracking-widest mb-3">
					{$activeGig.date} • {$activeGig.venue}
				</h3>
				<h2 class="text-4xl md:text-5xl font-black text-white leading-none mb-4 tracking-tighter">
					{$activeGig.artist}
				</h2>

				{#if $activeGig.full_lineup && $activeGig.full_lineup !== $activeGig.artist}
					<p class="text-zinc-500 text-sm font-serif">Lineup: {$activeGig.full_lineup}</p>
				{/if}
			</div>

			<!-- Scrollable Body -->
			<div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
				<!-- Description / Context -->
				{#if $activeGig.description}
					<div class="prose prose-invert prose-sm max-w-none">
						<p
							class="text-lg text-zinc-300 leading-relaxed font-serif italic border-l-4 border-zinc-800 pl-4"
						>
							"{$activeGig.description}"
						</p>
					</div>
				{/if}

				<!-- Media / YouTube -->
				{#if $activeGig.youtubeId}
					<div class="border border-zinc-800 bg-black/50 rounded-xl overflow-hidden group">
						<div
							class="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50"
						>
							<h4 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
								Archival Material
							</h4>
							<span
								class="text-[9px] font-mono text-amber-600 border border-amber-900/50 bg-amber-950/30 px-2 py-1 rounded"
							>
								⚠️ Tangential Context
							</span>
						</div>

						<div class="aspect-video w-full bg-zinc-900">
							<iframe
								class="w-full h-full"
								src="https://www.youtube.com/embed/{$activeGig.youtubeId}"
								title="YouTube video player"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>

						<div class="p-4 bg-zinc-900/80">
							<p class="text-[10px] text-zinc-500 font-mono leading-relaxed">
								Disclaimer: Direct footage of this specific night may not exist. This media is
								provided to establish the <span class="text-zinc-400">sonic texture</span> and
								<span class="text-zinc-400">visual aesthetic</span> of the era/tour.
							</p>
						</div>
					</div>
				{/if}

				<!-- Setlist Section -->
				<div class="space-y-4">
					<div class="flex items-baseline justify-between border-b border-zinc-800 pb-2">
						<h4 class="text-sm font-bold text-zinc-300 uppercase tracking-widest">Setlist Data</h4>
						{#if $activeGig.url}
							<a
								href={$activeGig.url}
								target="_blank"
								class="text-[10px] font-bold text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-wide flex items-center gap-1"
							>
								Source <span class="opacity-50">↗</span>
							</a>
						{/if}
					</div>

					{#if loading}
						<div class="animate-pulse space-y-3">
							<div class="h-4 bg-zinc-900 rounded w-3/4"></div>
							<div class="h-4 bg-zinc-900 rounded w-1/2"></div>
							<div class="h-4 bg-zinc-900 rounded w-5/6"></div>
						</div>
					{:else if error}
						<div class="p-4 border border-red-900/20 bg-red-950/10 rounded-lg">
							<p class="text-xs text-red-400 font-mono">{error}</p>
						</div>
					{:else if setlistData && setlistData.sets && setlistData.sets.set}
						<div class="relative">
							<!-- "Paper" effect for setlist -->
							<div
								class="absolute -left-3 top-0 bottom-0 w-px border-l border-dashed border-zinc-800"
							></div>

							<div class="space-y-6">
								{#each setlistData.sets.set as set}
									<div>
										{#if set.name || set.encore}
											<h5
												class="text-[10px] text-amber-500/70 uppercase font-black tracking-widest mb-3 pl-4"
											>
												{set.encore ? `// Encore ${set.encore}` : `// ${set.name}`}
											</h5>
										{/if}

										{#if set.song && set.song.length > 0}
											<ol class="space-y-3">
												{#each set.song as song, i}
													<li
														class="flex gap-4 group/song hover:bg-zinc-900/50 p-2 rounded -ml-2 transition-colors"
													>
														<span class="text-xs font-mono text-zinc-600 w-6 text-right pt-0.5"
															>{i + 1}.</span
														>
														<div class="flex-1">
															<div
																class="text-sm font-bold text-zinc-200 group-hover/song:text-white"
															>
																{song.name}
															</div>
															{#if song.cover}
																<div class="text-[10px] text-zinc-500 mt-0.5">
																	Original by {song.cover.name}
																</div>
															{/if}
															{#if song.info}
																<div class="text-[10px] text-zinc-600 mt-0.5 font-mono">
																	[{song.info}]
																</div>
															{/if}
														</div>
													</li>
												{/each}
											</ol>
										{/if}
									</div>
								{/each}

								{#if !setlistData.sets.set.length && $activeGig.has_songs}
									<p class="text-sm text-zinc-500 italic pl-4">
										No individual songs found in this record.
									</p>
								{/if}
							</div>
						</div>
					{:else if !$activeGig.has_songs}
						<div class="p-8 text-center border border-zinc-900 rounded-xl bg-zinc-900/30">
							<p class="text-sm text-zinc-500 font-serif italic">"The tape matches the silence."</p>
							<p class="text-[10px] text-zinc-700 uppercase mt-2 tracking-widest font-bold">
								No Setlist Available
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div
				class="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase shrink-0"
			>
				<span>Potteries Archive Protocol</span>
				<span>ID: {$activeGig.id}</span>
			</div>
		</div>
	</div>
{/if}
