<script>
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { dev } from '$app/environment';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidecar from '$lib/components/Sidecar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import GlobalFooter from '$lib/components/GlobalFooter.svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();
</script>

<div
	class="antialiased bg-zinc-950 text-zinc-300 font-sans selection:bg-amber-500/30 selection:text-amber-200 min-h-screen pb-20"
>
	<Navbar />
	<main class="pt-0">
		{@render children()}
	</main>
	<Footer />
	<Sidecar />
</div>

<GlobalFooter />
