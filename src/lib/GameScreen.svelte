<script lang="ts">
	import ProfileCard from './ProfileCard.svelte';
	import ResultCard from './ResultCard.svelte';
	import { send, skip, chart, gear, x, check, initials } from './icons.js';
	import profiles from './data/profiles.json';

	type Profile = (typeof profiles)[0];
	type Guess = { name: string | null; correct: boolean; skipped: boolean };

	let {
		target,
		guesses,
		status,
		cluesrevealed = 1,
		maxguesses = 6,
		dark = $bindable(false),
		revealmode = $bindable<'all' | 'progressive'>('all'),
		onsubmitguess,
		onskip,
		onnext,
		onopenstats
	}: {
		target: Profile;
		guesses: Guess[];
		status: 'playing' | 'won' | 'lost';
		cluesrevealed: number;
		maxguesses: number;
		dark: boolean;
		revealmode: 'all' | 'progressive';
		onsubmitguess: (name: string) => void;
		onskip: () => void;
		onnext: () => void;
		onopenstats: () => void;
	} = $props();

	let query = $state('');
	let showautocomplete = $state(false);
	let activeidx = $state(0);
	let showsettings = $state(false);

	const ended = $derived(status !== 'playing');
	const usedcount = $derived(guesses.length);
	const guessednames = $derived(
		new Set(guesses.filter((g) => g.name != null).map((g) => g.name as string))
	);

	const suggestions = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [] as Profile[];
		return profiles
			.filter((p) => !guessednames.has(p.name))
			.filter((p) => p.name.toLowerCase().includes(q))
			.slice(0, 6);
	});

	const reveals = $derived.by(() => {
		if (revealmode === 'all' || ended) return { edu: Infinity, exp: Infinity };
		const edumax = target.education.length;
		const expmax = target.experience.length;
		let edu = 0,
			exp = 0;
		for (let i = 0; i < cluesrevealed; i++) {
			const preferexp = i % 2 === 0;
			if (preferexp && exp < expmax) exp++;
			else if (!preferexp && edu < edumax) edu++;
			else if (exp < expmax) exp++;
			else if (edu < edumax) edu++;
		}
		return { edu, exp };
	});

	function submit(name: string) {
		if (!name || ended) return;
		onsubmitguess(name);
		query = '';
		showautocomplete = false;
	}

	function handlesubmit() {
		if (suggestions.length > 0) submit(suggestions[activeidx].name);
	}

	function onkey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeidx = Math.min(activeidx + 1, suggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeidx = Math.max(activeidx - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			handlesubmit();
		} else if (e.key === 'Escape') {
			showautocomplete = false;
			showsettings = false;
		}
	}
</script>

<div class="app">
	<header class="topbar">
		<div
			class="brand"
			role="button"
			tabindex="0"
			onclick={onnext}
			onkeypress={onnext}
			title="New round"
		>
			<div class="logo">li</div>
			<span class="name">linkl<em>e</em></span>
		</div>
		<div class="topbar-right">
			<button class="btn btn-ghost" onclick={onskip} disabled={ended}>
				{@html skip} Skip
			</button>
			<div class="counter-pill" title="{usedcount} of {maxguesses} used">
				<span>{usedcount}/{maxguesses}</span>
				<span class="dot-row">
					{#each Array.from({ length: maxguesses }) as _, i}
						{@const g = guesses[i]}
						<span class="dot {g ? (g.skipped ? 'skipped' : 'used') : ''}"></span>
					{/each}
				</span>
			</div>
			<button class="icon-btn" onclick={onopenstats} title="Stats">
				{@html chart}
			</button>
			<button
				class="icon-btn"
				onclick={() => (showsettings = !showsettings)}
				title="Settings"
				aria-pressed={showsettings}
			>
				{@html gear}
			</button>
		</div>
	</header>

	{#if showsettings}
		<div class="settings-panel">
			<div class="settings-row">
				<span class="settings-label">Dark mode</span>
				<button
					class="toggle {dark ? 'on' : ''}"
					role="switch"
					aria-checked={dark}
					aria-label="Toggle dark mode"
					onclick={() => (dark = !dark)}
				>
					<i></i>
				</button>
			</div>
			<div class="settings-row">
				<span class="settings-label">Reveal clues</span>
				<div class="seg">
					<button
						class={revealmode === 'all' ? 'active' : ''}
						onclick={() => (revealmode = 'all')}
					>
						All at once
					</button>
					<button
						class={revealmode === 'progressive' ? 'active' : ''}
						onclick={() => (revealmode = 'progressive')}
					>
						One by one
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="mystery-banner">
		<div class="redacted-avatar"></div>
		<div class="redacted-info">
			<div class="redacted-name"></div>
			<div class="redacted-tag">— guess who, from their profile below</div>
		</div>
	</div>

	<div class="cards">
		<ProfileCard
			title="Education"
			icontype="education"
			entries={target.education}
			fieldheading="institution"
			fieldsub="degree"
			fieldmeta="year"
			revealcount={reveals.edu}
		/>
		<ProfileCard
			title="Experience"
			icontype="experience"
			entries={target.experience}
			fieldheading="company"
			fieldsub="role"
			fieldmeta="duration"
			revealcount={reveals.exp}
		/>
	</div>

	{#if ended}
		<ResultCard {target} status={status as 'won' | 'lost'} {guesses} {onnext} onstats={onopenstats} />
	{:else}
		<div class="guess-panel">
			<div class="guess-label">Your guess — {maxguesses - usedcount} left</div>
			<div class="guess-input-wrap">
				<input
					class="guess-input"
					placeholder="Type a name…"
					value={query}
					oninput={(e) => {
						query = (e.currentTarget as HTMLInputElement).value;
						showautocomplete = true;
						activeidx = 0;
					}}
					onfocus={() => (showautocomplete = true)}
					onblur={() => setTimeout(() => (showautocomplete = false), 120)}
					onkeydown={onkey}
					autocomplete="off"
					spellcheck={false}
				/>
				<button class="guess-submit" onclick={handlesubmit} disabled={suggestions.length === 0}>
					{@html send}
				</button>
				{#if showautocomplete && suggestions.length > 0}
					<div class="autocomplete" role="listbox">
						{#each suggestions as p, i}
							<div
								class="autocomplete-item {i === activeidx ? 'active' : ''}"
								role="option"
								tabindex="-1"
								aria-selected={i === activeidx}
								onmousedown={(e) => {
									e.preventDefault();
									submit(p.name);
								}}
								onmouseenter={() => (activeidx = i)}
							>
								<div class="autocomplete-avatar">{initials(p.name)}</div>
								<div class="autocomplete-text">
									<div class="autocomplete-name">{p.name}</div>
									<div class="autocomplete-role">{p.type}</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			{#if guesses.length > 0}
				<div class="guess-list">
					{#each guesses as g, i}
						<div class="guess-row {g.skipped ? 'skipped' : g.correct ? 'correct' : 'wrong'}">
							<span class="guess-num">{i + 1}</span>
							<span class="guess-icon">
								{#if g.skipped}
									{@html skip}
								{:else if g.correct}
									{@html check}
								{:else}
									{@html x}
								{/if}
							</span>
							<span class="guess-name">{g.skipped ? 'Skipped' : g.name}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div class="hint">Profiles are fictional, for prototype use only.</div>
</div>
