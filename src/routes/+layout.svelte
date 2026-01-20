<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import GigDetailModal from '$lib/components/GigDetailModal.svelte';

	let { children } = $props();
</script>

<div
	class="antialiased bg-zinc-950 text-zinc-300 font-sans selection:bg-amber-500/30 selection:text-amber-200 min-h-screen"
>
	<Navbar />
	<main class="pt-0">
		{@render children()}
	</main>
	<GigDetailModal />
</div>
