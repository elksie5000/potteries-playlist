<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { data, years, color, label } = $props();

	let canvas;
	let chart;

	onMount(() => {
		const ctx = canvas.getContext('2d');

		// Create gradient
		const gradient = ctx.createLinearGradient(0, 0, 0, 400);
		gradient.addColorStop(0, color);
		gradient.addColorStop(1, 'transparent');

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: years,
				datasets: [
					{
						label: label,
						data: data,
						borderColor: color,
						backgroundColor: color + '20', // Low opacity fill
						fill: true,
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 0,
						pointHoverRadius: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: '#18181b',
						titleColor: '#a1a1aa',
						bodyColor: '#fff',
						borderColor: '#27272a',
						borderWidth: 1
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x',
					intersect: false
				},
				scales: {
					x: {
						display: true,
						grid: { display: false },
						ticks: {
							color: '#52525b',
							font: { family: 'monospace', size: 10 },
							maxTicksLimit: 10
						}
					},
					y: {
						display: false, // Minimized look
						beginAtZero: true
					}
				}
			}
		});

		return () => {
			if (chart) chart.destroy();
		};
	});
</script>

<div class="w-full h-32 md:h-48 relative">
	<canvas bind:this={canvas}></canvas>
</div>
