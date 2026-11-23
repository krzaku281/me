<script lang="ts">
	import type { Snippet } from 'svelte';
	import { navLabel, pageLead, pageTitle } from '#lib/i18n/index.ts';
	import { NAVIGATION, type PageId } from '#lib/i18n/routes.ts';

	interface Props {
		id: PageId;
		/** Image next to the title, e.g. a club logo; the page sets its size. */
		logo?: Snippet;
		/** Shown right under the lead, e.g. a link button with class "cta". */
		actions?: Snippet;
		children: Snippet;
	}

	let { id, logo, actions, children }: Props = $props();

	const group = $derived(
		NAVIGATION.find((item) => item.kind === 'group' && item.children.includes(id))
	);
</script>

<article class="page">
	<header class:with-logo={logo}>
		{#if logo}
			<!-- Next to the eyebrow and title; the lead runs below at full width -->
			<div class="logo" style:grid-row={group ? 'span 2' : undefined}>{@render logo()}</div>
		{/if}
		{#if group}
			<p class="eyebrow">{navLabel(group.id)}</p>
		{/if}
		<h1>{pageTitle(id)}</h1>
		<p class="lead">{pageLead(id)}</p>
		{#if actions}
			<div class="actions">{@render actions()}</div>
		{/if}
	</header>

	{@render children()}
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

	header.with-logo {
		grid-template-columns: auto 1fr;
		column-gap: clamp(1rem, 3vw, 1.5rem);
	}

	.with-logo > :not(.logo, .eyebrow, h1) {
		grid-column: 1 / -1;
	}

	.logo {
		align-self: center;
	}

	.with-logo h1 {
		align-self: center;
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
</style>
