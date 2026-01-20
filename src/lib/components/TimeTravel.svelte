<script>
	export let year;
	export let min = 1960;
	export let max = 2005;
</script>

<div
	class="flex flex-col items-center gap-2 p-4 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700 shadow-xl w-full max-w-md mx-auto"
>
	<label for="time-travel" class="text-sm font-bold tracking-widest text-[#dbf6e6] uppercase"
		>Time Travel</label
	>
	<div class="flex items-center gap-4 w-full">
		<span class="text-zinc-500 font-mono text-xs">{min}</span>
		<input
			id="time-travel"
			type="range"
			bind:value={year}
			{min}
			{max}
			class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00ff9d] slider-thumb"
		/>
		<span class="text-zinc-500 font-mono text-xs">{max}</span>
	</div>
	<div class="text-4xl font-black font-mono text-[#00ff9d] animate-pulse">
		{year}
	</div>
</div>

<style>
	/* Custom Slider Styling */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #00ff9d;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
		margin-top: -6px;
	}
	input[type='range']::-moz-range-thumb {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #00ff9d;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
	}
	input[type='range']::-webkit-slider-runnable-track {
		width: 100%;
		height: 8px;
		cursor: pointer;
		background: #27272a;
		border-radius: 4px;
	}
</style>
