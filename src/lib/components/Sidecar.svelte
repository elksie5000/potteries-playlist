<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { activeDrawer, closeDrawer } from '$lib/stores/navigation';
	import { receive } from '$lib/utils/animation';

	// Subscribe to the store
	let drawerState = $state(null);
	let isFetchingSetlist = $state(false);

	// Log updates & Fetch if needed
	activeDrawer.subscribe(async (val) => {
		drawerState = val;
		if (
			val &&
			val.type === 'gig' &&
			val.data.has_songs &&
			(!val.data.songs || val.data.songs.length === 0)
		) {
			// Need to fetch
			isFetchingSetlist = true;
			try {
				const res = await fetch(`/api/setlist?url=${encodeURIComponent(val.data.url)}`);
				if (res.ok) {
					const json = await res.json();
					if (json.songs && json.songs.length > 0) {
						// Update the LOCAL state only (doesn't persist to store unless we write back)
						// For display purposes, updating drawerState.data is enough if Svelte reactivity catches it.
						// Svelte 5 state is deep reactive usually?
						// Wait, drawerState is derived from store. Mutating it might not trigger UI if it's not a primitive replacement.
						// Let's force update.
						val.data.songs = json.songs;
						// Trigger reactivity? assigning to drawerState again might work?
						// Or just let Svelte 5 handle mutation of state object?
						// I'll reassign drawerState to be safe.
						drawerState = { ...val };
					}
				}
			} catch (e) {
				console.error('Fetch failed', e);
			} finally {
				isFetchingSetlist = false;
			}
		} else {
			isFetchingSetlist = false;
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') closeDrawer();
	}}
/>

{#if drawerState}
	<!-- Backdrop (Optional, keeps focus or allows click-away) -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[90] cursor-pointer"
		onclick={closeDrawer}
		transition:fly={{ duration: 200, opacity: 0 }}
	></div>

	<!-- Sidecar Panel -->
	<div
		class="fixed top-0 right-0 h-full w-[85vw] md:w-[33vw] md:min-w-[400px] bg-zinc-950 border-l border-amber-500/50 z-[100] shadow-2xl overflow-y-auto"
		transition:fly={{ x: 400, duration: 400, easing: quintOut, opacity: 1 }}
	>
		<!-- Header / Controls -->
		<div
			class="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex justify-between items-center"
		>
			<span class="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
				{drawerState.type} :: Details
			</span>
			<button
				onclick={closeDrawer}
				class="text-zinc-500 hover:text-amber-500 transition-colors uppercase font-bold text-xs tracking-wider"
			>
				[Close]
			</button>
		</div>

		<!-- Content Slot -->
		<div class="p-6">
			{#if drawerState.type === 'gig'}
				{@const gig = drawerState.data}
				<div class="space-y-8">
					<!-- Hero -->
					<div in:receive={{ key: gig.id || gig.artist + gig.date }}>
						<h1 class="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
							{gig.artist}
						</h1>
						<div class="flex flex-col gap-1 font-mono text-xs text-zinc-400">
							<span class="text-amber-600">{gig.date}</span>
							<span>{gig.venue}</span>
						</div>
					</div>

					<!-- Metadata -->
					{#if gig.has_songs}
						<div class="bg-zinc-900 p-4 border border-zinc-800">
							<div
								class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 flex justify-between items-center"
							>
								<span>Setlist</span>
								{#if isFetchingSetlist}
									<span class="animate-pulse text-amber-500">Loading...</span>
								{/if}
							</div>

							{#if gig.songs && gig.songs.length > 0}
								<div class="mb-4">
									<ol class="list-decimal list-inside space-y-1">
										{#each gig.songs as song}
											<li class="text-zinc-300 text-sm font-bold tracking-tight">{song}</li>
										{/each}
									</ol>
								</div>
							{:else if !isFetchingSetlist}
								<div class="mb-4 text-xs text-zinc-500 font-mono">No tracks found.</div>
							{/if}

							<p class="text-zinc-400 text-sm italic">
								Setlist data available locally or via Setlist.fm link.
							</p>
							{#if gig.url}
								<a
									href={gig.url}
									target="_blank"
									class="inline-block mt-4 text-[10px] text-zinc-500 hover:text-zinc-300 border-b border-zinc-800 hover:border-zinc-500 transition-all"
								>
									View Original Source →
								</a>
							{/if}
						</div>
					{/if}

					<!-- Spacer -->
					<div class="h-12 border-l border-dashed border-zinc-800 ml-2"></div>
				</div>
			{:else if drawerState.type === 'band'}
				{@const band = drawerState.data}
				<div class="space-y-8">
					<div in:receive={{ key: 'band-' + band.name }}>
						<h1 class="text-3xl font-black text-white uppercase tracking-tighter mb-4">
							{band.name}
						</h1>
						<div
							class="inline-block px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-400"
						>
							{band.genre}
						</div>
					</div>

					<!-- Gig List -->
					<div>
						<h3
							class="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-zinc-800 pb-2"
						>
							Performance History ({band.gigs.length})
						</h3>
						<div class="space-y-3">
							{#each band.gigs as gig}
								<button
									class="w-full text-left p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-all rounded flex justify-between items-center group"
									onclick={() => activeDrawer.set({ type: 'gig', data: gig })}
								>
									<div>
										<div class="text-[10px] font-mono text-zinc-500 uppercase">{gig.date}</div>
										<div
											class="font-bold text-zinc-200 text-sm group-hover:text-amber-500 transition-colors"
										>
											{gig.venue.replace('The ', '')}
										</div>
									</div>
									<div class="text-zinc-600 group-hover:text-amber-500 text-xs">→</div>
								</button>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="text-zinc-500 font-mono text-xs">
					Content type '{drawerState.type}' not recognized.
				</div>
			{/if}
		</div>
	</div>
{/if}
