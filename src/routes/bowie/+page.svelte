<script lang="ts">
	const { data } = $props();
	$inspect(data);
</script>

<h1>Bowie test</h1>

<div class="grid">
	{#each data.gigs as gig}
		<div class="card">
			<div class="header">
				{gig.dateString}
			</div>
			<h2>{gig.venue}, {gig.city}, {gig.country}</h2>
			{#if gig.isHomeCountry}
				<p>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Home country!</p>
			{/if}
			<div class="setlist">
				<div class="songs">
					<p>Songs: {gig.songs.join(', ')}</p>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	/* 1. THE LAYOUT */
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: 'Helvetica Neue', sans-serif;
	}

	h1 {
		border-bottom: 4px solid #ff3e00; /* Bowie Orange */
		padding-bottom: 10px;
		margin-bottom: 30px;
	}

	/* 2. THE GRID (Make them cards) */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	/* 3. THE CARD DESIGN */
	.card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 20px;
		background: white;
		box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.08);
		transition: transform 0.2s;
	}

	.card:hover {
		transform: translateY(-5px); /* Lift up on hover */
		border-color: #ff3e00;
	}

	.date {
		font-size: 0.85rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	h2 {
		margin: 10px 0;
		font-size: 1.2rem;
		color: #222;
	}

	.songs {
		font-size: 0.9rem;
		line-height: 1.5;
		color: #555;
	}

	.empty {
		font-style: italic;
		color: #999;
	}
</style>
