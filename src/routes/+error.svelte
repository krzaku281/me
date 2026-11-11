<script lang="ts">
	import { page } from '$app/state';
	import { pageHref } from '#lib/i18n/index.ts';
	import { DEFAULT_LOCALE } from '#lib/i18n/config.ts';
	import { localeFromPath } from '#lib/i18n/routes.ts';
	import { m } from '#lib/paraglide/messages.js';

	// Unknown URLs match no route, so take the language from the URL itself.
	const locale = $derived(
		localeFromPath(page.url.pathname.slice(__BASE_PATH__.length)) ?? DEFAULT_LOCALE
	);
	const message = $derived(
		page.status === 404 ? m['error.notFound']({}, { locale }) : m['error.generic']({}, { locale })
	);
</script>

<svelte:head>
	<title>{page.status}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error" {@attach (node) => node.closest('html')?.setAttribute('lang', locale)}>
	<p class="status">{page.status}</p>
	<h1>{message}</h1>
	<a href={pageHref('home', locale)}>{m['error.back']({}, { locale })}</a>
</main>

<style>
	.error {
		display: grid;
		place-content: center;
		gap: 1.25rem;
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

	h1 {
		font-size: 1.25rem;
	}
</style>
