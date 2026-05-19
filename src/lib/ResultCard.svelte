<script lang="ts">
	import { ext } from './icons.js';
	import type profiles from './data/profiles.json';

	type Profile = (typeof profiles)[0];
	type Guess = { name: string | null; correct: boolean; skipped: boolean };

	let {
		target,
		status,
		guesses,
		onnext,
		onstats
	}: {
		target: Profile;
		status: 'won' | 'lost';
		guesses: Guess[];
		onnext: () => void;
		onstats: () => void;
	} = $props();

	const won = $derived(status === 'won');
	const guessnum = $derived(guesses.findIndex((g) => g.correct) + 1);
</script>

<div class="result-card">
	<span class="result-badge {won ? 'win' : 'loss'}">
		{won ? `Got it in ${guessnum}` : 'Out of guesses'}
	</span>

	<img src={target.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(target.name) + '&background=random'} alt={target.name} class="result-photo" />

	<div class="result-name">{target.name}</div>
	<div class="result-role">{target.type} · IIIT Hyderabad</div>
	<a class="result-link" href={target.linkedin_url} target="_blank" rel="noopener noreferrer">
		{target.linkedin_url.replace('https://www.', '')}
		{@html ext}
	</a>
	<div class="result-actions">
		<button class="btn btn-ghost" onclick={onstats}>View stats</button>
		<button class="btn btn-primary" onclick={onnext}>Next →</button>
	</div>
</div>
