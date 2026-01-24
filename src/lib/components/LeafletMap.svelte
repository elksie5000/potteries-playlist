<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let mapElement;
	let map;
	let leafletLib;

	export let venue; // { lat, lng, name, id }
	export let gigs = []; // Array of gig objects

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

			map = L.map(mapElement).setView([venue.lat, venue.lng], 15);

			L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 19
			}).addTo(map);

			// Helper to force grayscale
			mapElement.style.filter = 'grayscale(100%) invert(100%) contrast(1.2)';

			updateMap(venue);
		}
	});

	$: if (map && venue && leafletLib) {
		updateMap(venue);
	}

	function updateMap(v) {
		if (!map || !leafletLib) return;

		const L = leafletLib;

		// Update view
		map.setView([v.lat, v.lng], 15, { animate: true });

		// Clear markers
		map.eachLayer((layer) => {
			if (layer instanceof L.Marker) {
				map.removeLayer(layer);
			}
		});

		// Add correct marker
		if (v.special) {
			const pulseIcon = L.divIcon({
				className: 'custom-div-icon',
				html: `<div style="background-color: #facc15; width: 40px; height: 40px; border-radius: 50%; border: 4px solid #000; animation: pulse 1s infinite; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">⚡</div>`,
				iconSize: [40, 40],
				iconAnchor: [20, 20]
			});

			L.marker([v.lat, v.lng], { icon: pulseIcon })
				.addTo(map)
				.bindPopup(
					`<div style="text-align:center;"><b style="font-size: 1.2em; color: #facc15; text-transform: uppercase;">${v.special}</b><br><span style="font-weight:900;">${v.name}</span><br>${v.era}</div>`
				)
				.openPopup();
		} else {
			L.marker([v.lat, v.lng]).addTo(map).bindPopup(`<b>${v.name}</b><br>${v.era}`).openPopup();
		}
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
