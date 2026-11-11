<script lang="ts">
	import InlineScript from '#lib/components/InlineScript.svelte';
	import { pageHref } from '#lib/i18n/index.ts';
	import { DEFAULT_LOCALE, LOCALES, textDirection } from '#lib/i18n/config.ts';
	import { m } from '#lib/paraglide/messages.js';

	// GitHub Pages serves this file for every unknown URL. The page shows one block per
	// language; the script keeps the one matching the URL (/pl/..., /de/...). Without JS all show.
	const pick = `(function(){var b=${JSON.stringify(__BASE_PATH__)},L=${JSON.stringify(LOCALES)},p=location.pathname.slice(b.length).split("/")[1],l=L.indexOf(p)>=0?p:${JSON.stringify(DEFAULT_LOCALE)},h=document.documentElement;h.lang=l;h.dir=document.querySelector("[data-nf="+l+"]").dir;document.querySelectorAll("[data-nf]").forEach(function(e){e.hidden=e.dataset.nf!==l})})()`;
</script>

<svelte:head>
	<title>404</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error">
	<p class="status" aria-hidden="true">404</p>
	{#each LOCALES as locale (locale)}
		<div class="msg" data-nf={locale} lang={locale} dir={textDirection(locale)}>
			<h1>{m['error.notFound']({}, { locale })}</h1>
			<a href={pageHref('home', locale)}>{m['error.back']({}, { locale })}</a>
		</div>
	{/each}
</main>

<InlineScript code={pick} />

<style>
	.error {
		display: grid;
		place-content: center;
		gap: 2rem;
		min-block-size: 100dvh;
		padding: var(--gutter);
		text-align: center;
	}

	.status {
		font-size: clamp(4rem, 18vw, 9rem);
		line-height: 1;
		color: var(--g-4);
		letter-spacing: -0.05em;
	}

	.msg {
		display: grid;
		gap: 0.75rem;
	}

	.error :global([hidden]) {
		display: none;
	}

	h1 {
		font-size: 1.25rem;
	}
</style>
