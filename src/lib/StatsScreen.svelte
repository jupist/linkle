<script lang="ts">
	import { back } from './icons.js';

	let {
		stats,
		lastguessnum,
		onback
	}: {
		stats: {
			played: number;
			wins: number;
			guess_distribution: number[];
			streak: number;
		};
		lastguessnum: number | null;
		onback: () => void;
	} = $props();

	const winrate = $derived(stats.played ? Math.round((stats.wins / stats.played) * 100) : 0);
	const maxbar = $derived(Math.max(...stats.guess_distribution, 1));
</script>

<div class="app">
	<div class="stats-page">
		<button class="stats-back" onclick={onback}>
			{@html back} Back to game
		</button>
		<div class="stats-title">Your stats</div>
		<div class="stats-subtitle">Across all rounds on this browser.</div>

		<div class="stat-grid">
			<div class="stat-card">
				<div class="stat-value">{stats.played}</div>
				<div class="stat-label">Played</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{winrate}%</div>
				<div class="stat-label">Win rate</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{stats.streak}</div>
				<div class="stat-label">Streak</div>
			</div>
		</div>

		<div class="distribution-title">Guess distribution</div>
		{#each stats.guess_distribution as count, i}
			{@const pct = (count / maxbar) * 100}
			{@const highlight = lastguessnum === i + 1}
			<div class="dist-row">
				<div class="dist-label">{i + 1}</div>
				<div class="dist-bar-track">
					<div
						class="dist-bar-fill {count === 0 ? 'zero' : highlight ? 'highlight' : ''}"
						style="width: {count === 0 ? '100%' : `max(${pct}%, 28px)`}"
					>
						{count}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
