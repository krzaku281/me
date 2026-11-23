<script lang="ts">
	import { page } from '$app/state';
	import Page from '#lib/components/Page.svelte';
	import { images } from '#lib/images/index.ts';
	import { navLabel, pageHref } from '#lib/i18n/index.ts';
	import { toLocale } from '#lib/i18n/config.ts';
	import { m } from '#lib/paraglide/messages.js';

	const locale = $derived(toLocale(page.params.lang));

	/** Where to go next: each section links to its first page. */
	const sections = $derived([
		{ id: 'education', first: 'technician', text: m['about.sections.education']() },
		{ id: 'sport', first: 'club', text: m['about.sections.sport']() },
		{ id: 'growth', first: 'prana', text: m['about.sections.growth']() },
		{ id: 'youtube', first: 'youtube', text: m['about.sections.youtube']() }
	] as const);
</script>

<Page id="about">
	{#snippet logo()}
		<enhanced:img
			class="portrait"
			src={images.portrait}
			alt={m['photo.portrait']()}
			sizes="(min-width: 48rem) 9rem, 6rem"
			fetchpriority="high"
			decoding="async"
		/>
	{/snippet}

	<div class="prose">
		<p>{m['page.about.body.p1']()}</p>
		<p>{m['page.about.body.p2']()}</p>
		<p>{m['page.about.body.p3']()}</p>
		<p>{m['page.about.body.p4']()}</p>
	</div>

	<nav aria-label={m['about.sections.label']()}>
		<ul>
			{#each sections as section (section.id)}
				<li>
					<a href={pageHref(section.first, locale)}>
						<span class="name">{navLabel(section.id)} <span aria-hidden="true">→</span></span>
						<span class="text">{section.text}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</Page>

<style>
	.portrait {
		display: block;
		inline-size: clamp(6rem, 3rem + 10vw, 9rem);
		block-size: auto;
		border-radius: 50%;
		box-shadow:
			0 0 0 1px var(--line),
			var(--shadow);
	}

	/* Two by two on wide screens, one per row on phones */
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: grid;
		gap: 0.35rem;
		block-size: 100%;
		padding: 1rem 1.1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(var(--g-3), var(--g-2));
		box-shadow: var(--shadow);
		text-decoration: none;
		transition: border-color 0.2s var(--ease);
	}

	a:hover {
		border-color: var(--g-6);
	}

	.name {
		color: var(--strong);
		font-size: 0.875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.text {
		color: var(--g-7);
		font-size: 0.8125rem;
	}
</style>
