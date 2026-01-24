<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let mapElement;
	let map;
	let leafletLib;

	export let venue = null; // Optional: Center/Active venue
	export let venues = []; // Optional: List of all venues to plot

	onMount(async () => {
		if (browser) {
			const L = await import('leaflet');
			leafletLib = L;
			await import('leaflet/dist/leaflet.css');

			// Fix marker icons
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
			});

			if (!mapElement) return;

			// Default Center (Stoke)
			let center = [53.0037, -2.1794];
			let zoom = 12;

			if (venue) {
				center = [venue.lat, venue.lng];
				zoom = 15;
			} else if (venues.length > 0) {
				// Center roughly on the first one or calculate bounds?
				// Just keep it simple: Stoke center.
			}

			map = L.map(mapElement).setView(center, zoom);

			L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 19
			}).addTo(map);

			// Helper to force grayscale
			mapElement.style.filter = 'grayscale(100%) invert(100%) contrast(1.2)';

			updateMap();
		}
	});

	$: if (map && leafletLib && (venue || venues.length)) {
		updateMap();
	}

	function updateMap() {
		if (!map || !leafletLib) return;
		const L = leafletLib;

		// Move view if specific venue selected
		if (venue) {
			map.setView([venue.lat, venue.lng], 15, { animate: true });
		}

		// Clear markers
		map.eachLayer((layer) => {
			if (layer instanceof L.Marker) {
				map.removeLayer(layer);
			}
		});

		// Determine what to plot
		const points = venues.length > 0 ? venues : venue ? [venue] : [];

		points.forEach((v) => {
			// Simple logic: if it's the active 'venue', maybe highlight it?
			// For now, just plot them all.
			L.marker([v.lat, v.lng]).addTo(map).bindPopup(`<b>${v.name}</b>`);
		});
	}

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="h-full w-full bg-zinc-900" bind:this={mapElement}></div>

<style>
	:global(.leaflet-popup-content-wrapper) {
		background: #18181b; /* zinc-900 */
		color: #e4e4e7; /* zinc-200 */
		border: 1px solid #3f3f46;
		border-radius: 0.5rem;
	}
	:global(.leaflet-popup-tip) {
		background: #18181b;
	}
</style>
