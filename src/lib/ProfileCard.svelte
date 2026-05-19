<script lang="ts">
	import { cap, bag, lock, entryicon } from './icons.js';

	const COLLAPSED = 3;

	let {
		title,
		icontype,
		entries,
		fieldheading,
		fieldsub,
		fieldmeta,
		revealcount
	}: {
		title: string;
		icontype: 'education' | 'experience';
		entries: Record<string, string>[];
		fieldheading: string;
		fieldsub: string;
		fieldmeta: string;
		revealcount: number;
	} = $props();

	let expanded = $state(false);
	const visible = $derived(expanded ? entries : entries.slice(0, COLLAPSED));
	const hasmore = $derived(entries.length > COLLAPSED);
</script>

<section class="profile-card">
	<div class="card-header">
		{@html icontype === 'education' ? cap : bag}
		<span>{title}</span>
	</div>
	<div class="entries">
		{#each visible as e, i}
			{@const locked = revealcount != null && i >= revealcount}
			<div class="entry {locked ? 'locked' : ''}">
				<div class="entry-icon">
					<span class="entry-mono">{entryicon(e[fieldheading])}</span>
					<span class="lock-icon">{@html lock}</span>
				</div>
				<div class="entry-body">
					<div class="entry-heading">{locked ? '████████████ ████' : e[fieldheading]}</div>
					<div class="entry-sub">{locked ? '████████ ███ ████' : e[fieldsub]}</div>
					<div class="entry-meta">{locked ? '████ – ████' : e[fieldmeta]}</div>
					{#if e.description}
						<div class="entry-desc">
							{locked
								? '████ ████████ ███ █████ ████ ██████ █████ ██████ ███████ ████.'
								: e.description}
						</div>
					{/if}
				</div>
			</div>
		{/each}

		{#if hasmore}
			<button class="show-more" onclick={() => (expanded = !expanded)}>
				{expanded ? 'Show less' : `+${entries.length - COLLAPSED} more`}
			</button>
		{/if}
	</div>
</section>
