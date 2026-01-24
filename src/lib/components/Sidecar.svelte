<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { activeDrawer, closeDrawer } from '$lib/stores/navigation';

	// Subscribe to the store
	let drawerState = $state(null);

	// Log updates for debugging
	activeDrawer.subscribe((val) => {
		drawerState = val;
	});
</script>

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
					<div>
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
							<div class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
								Setlist
							</div>
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

					<!-- Spacer for content expansion -->
					<div class="h-12 border-l border-dashed border-zinc-800 ml-2"></div>
				</div>
			{:else if drawerState.type === 'band'}
				{@const band = drawerState.data}
				<div class="space-y-6">
					<h1 class="text-3xl font-black text-white uppercase tracking-tighter">
						{band.name}
					</h1>
					<!-- Band specifics would go here -->
				</div>
			{:else}
				<div class="text-zinc-500 font-mono text-xs">
					Content type '{drawerState.type}' not recognized.
				</div>
			{/if}
		</div>
	</div>
{/if}
