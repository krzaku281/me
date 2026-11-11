<script lang="ts">
	import type { TimelineEntry } from '#lib/content/timeline.ts';
	import type { Locale } from '#lib/i18n/config.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { entries, locale }: { entries: readonly TimelineEntry[]; locale: Locale } = $props();
</script>

<section class="timeline" aria-label={m['timeline.label']()}>
	<ol>
		{#each entries as entry, i (i)}
			<li>
				<p class="period">{entry.period}</p>
				<h2>{entry.title[locale]}</h2>
				{#if entry.org}
					<p class="org">{entry.org}</p>
				{/if}
				{#if entry.text}
					<p class="text">{entry.text[locale]}</p>
				{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
	ol {
		position: relative;
		display: grid;
		gap: 2.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The line: fades in at the top and out at the bottom */
	ol::before {
		content: '';
		position: absolute;
		inset-block: 0.5rem 0;
		inset-inline-start: 0.3rem;
		inline-size: 1px;
		background: linear-gradient(transparent, var(--g-5) 2rem, var(--g-5) 70%, transparent);
	}

	li {
		position: relative;
		display: grid;
		gap: 0.35rem;
		padding-inline-start: 2.25rem;
	}

	/* The dot: a small ring with a soft glow */
	li::before {
		content: '';
		position: absolute;
		inset-block-start: 0.45rem;
		inset-inline-start: 0;
		inline-size: 0.65rem;
		block-size: 0.65rem;
		border: 1px solid var(--g-7);
		border-radius: 50%;
		background: var(--g-1);
		box-shadow:
			0 0 0 4px var(--g-1),
			0 0 1rem rgb(255 255 255 / 0.08);
	}

	li:first-child::before {
		background: var(--g-8);
		border-color: var(--g-8);
	}

	.period {
		color: var(--g-6);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		font-variant-numeric: tabular-nums;
	}

	h2 {
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
	}

	.org {
		color: var(--g-7);
		font-size: 0.875rem;
	}

	.text {
		color: var(--muted);
		font-size: 0.9375rem;
	}
</style>
