<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { TIMELINES } from '#lib/content/timeline.ts';
	import { navLabel, pageLead, pageTitle } from '#lib/i18n/index.ts';
	import { toLocale } from '#lib/i18n/config.ts';
	import { NAVIGATION, type PageId } from '#lib/i18n/routes.ts';
	import { m } from '#lib/paraglide/messages.js';
	import Timeline from './Timeline.svelte';

	let { id, children }: { id: PageId; children?: Snippet } = $props();

	const locale = $derived(toLocale(page.params.lang));
	const group = $derived(
		NAVIGATION.find((item) => item.kind === 'group' && item.children.includes(id))
	);
	const timeline = $derived(TIMELINES[id]);
</script>

<article class="page">
	<header>
		{#if group}
			<p class="eyebrow">{navLabel(group.id)}</p>
		{/if}
		<h1>{pageTitle(id)}</h1>
		<p class="lead">{pageLead(id)}</p>
	</header>

	{#if children}
		{@render children()}
	{/if}

	{#if timeline}
		<Timeline entries={timeline} {locale} />
	{:else if !children}
		<p class="placeholder">{m.placeholder()}</p>
	{/if}
</article>

<style>
	.page {
		display: grid;
		gap: 2.5rem;
	}

	header {
		display: grid;
		gap: 1rem;
		padding-block-end: 2.5rem;
		border-block-end: 1px solid var(--line);
	}

	.eyebrow {
		color: var(--g-6);
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	h1 {
		font-size: clamp(2rem, 1.4rem + 3vw, 3.5rem);
		background: linear-gradient(180deg, var(--g-9) 30%, var(--g-7));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		/* Morphs into the next page's title during view transitions */
		view-transition-name: page-title;
	}

	.lead {
		max-inline-size: 52ch;
		color: var(--muted);
		font-size: 1.0625rem;
	}

	.placeholder {
		color: var(--g-6);
	}
</style>
