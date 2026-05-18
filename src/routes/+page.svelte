<script lang="ts">
	import GameScreen from '$lib/GameScreen.svelte';
	import StatsScreen from '$lib/StatsScreen.svelte';
	import profiles from '$lib/data/profiles.json';

	const STORAGEKEY = 'linkle:v2';
	const MAXGUESSES = 6;

	type Profile = (typeof profiles)[0];
	type Guess = { name: string | null; correct: boolean; skipped: boolean };
	type Stats = {
		played: number;
		wins: number;
		guess_distribution: number[];
		streak: number;
	};

	function loadstate() {
		try {
			const raw = localStorage.getItem(STORAGEKEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	function pickrandom(): Profile {
		const unseen = profiles.filter((p) => !seen.includes(p.id));
		const pool = unseen.length ? unseen : profiles;
		return pool[Math.floor(Math.random() * pool.length)];
	}

	/** convert stored (string|null)[] to typed Guess[] using target name for correctness */
	function toguesses(stored: (string | null)[], targetname: string): Guess[] {
		return stored.map((g) => {
			if (g === null) return { name: null, correct: false, skipped: true };
			return { name: g, correct: g === targetname, skipped: false };
		});
	}

	const saved = loadstate();
	const savedcurrent = saved?.current;
	const validid = savedcurrent?.id && profiles.some((p: Profile) => p.id === savedcurrent.id);
	const initialtarget: Profile = validid
		? profiles.find((p: Profile) => p.id === savedcurrent.id)!
		: profiles[0]; // placeholder; seen not yet initialized

	let seen = $state<string[]>(saved?.seen ?? []);
	const savedstats = saved?.stats;
	let stats = $state<Stats>({
		played: savedstats?.played ?? 0,
		wins: savedstats?.wins ?? 0,
		guess_distribution: savedstats?.guess_distribution ?? [0, 0, 0, 0, 0, 0],
		streak: savedstats?.streak ?? 0
	});
	let dark = $state<boolean>(saved?.dark ?? false);
	let revealmode = $state<'all' | 'progressive'>(saved?.revealmode ?? 'all');
	let view = $state<'game' | 'stats'>('game');
	let target = $state<Profile>(validid ? initialtarget : pickrandom());
	let storedguesses = $state<(string | null)[]>(validid ? (savedcurrent.guesses ?? []) : []);
	let cluesrevealed = $state<number>(validid ? (savedcurrent.clues_revealed ?? 1) : 1);
	let status = $state<'playing' | 'won' | 'lost'>(validid ? (savedcurrent.status ?? 'playing') : 'playing');
	let lastguessnum = $state<number | null>(null);
	let roundkey = $state(0);

	const guesses = $derived(toguesses(storedguesses, target.name));

	$effect(() => {
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
	});

	$effect(() => {
		localStorage.setItem(
			STORAGEKEY,
			JSON.stringify({
				seen,
				stats,
				current: {
					id: target.id,
					guesses: storedguesses,
					clues_revealed: cluesrevealed,
					status
				},
				dark,
				revealmode
			})
		);
	});

	function submitguess(name: string) {
		const next = [...storedguesses, name];
		storedguesses = next;
		cluesrevealed++;
		if (name === target.name) {
			finishround('won', next);
		} else if (next.length >= MAXGUESSES) {
			finishround('lost', next);
		}
	}

	function skipguess() {
		const next = [...storedguesses, null];
		storedguesses = next;
		cluesrevealed++;
		if (next.length >= MAXGUESSES) finishround('lost', next);
	}

	function finishround(outcome: 'won' | 'lost', finalguesses: (string | null)[]) {
		status = outcome;
		const dist = [...stats.guess_distribution];
		let newstreak = stats.streak;
		let newwins = stats.wins;
		if (outcome === 'won') {
			const guessnum = finalguesses.indexOf(target.name) + 1;
			dist[guessnum - 1]++;
			newwins++;
			newstreak++;
			lastguessnum = guessnum;
		} else {
			newstreak = 0;
			lastguessnum = null;
		}
		seen = [...seen, target.id];
		stats = { played: stats.played + 1, wins: newwins, guess_distribution: dist, streak: newstreak };
	}

	function nextround() {
		// reset seen if all profiles exhausted
		if (profiles.every((p) => seen.includes(p.id))) seen = [];
		target = pickrandom();
		storedguesses = [];
		cluesrevealed = 1;
		status = 'playing';
		view = 'game';
		roundkey++;
	}
</script>

{#if view === 'stats'}
	<StatsScreen {stats} {lastguessnum} onback={() => (view = 'game')} />
{:else}
	{#key roundkey}
		<GameScreen
			{target}
			{guesses}
			{status}
			{cluesrevealed}
			maxguesses={MAXGUESSES}
			bind:dark
			bind:revealmode
			onsubmitguess={submitguess}
			onskip={skipguess}
			onnext={nextround}
			onopenstats={() => (view = 'stats')}
		/>
	{/key}
{/if}
