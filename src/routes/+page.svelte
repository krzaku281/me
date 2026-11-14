<script lang="ts">
	import redirect from '#lib/client/redirect.js?script';
	import InlineScript from '#lib/components/InlineScript.svelte';
	import {
		DEFAULT_LOCALE,
		LANGUAGE_NAMES,
		LOCALES,
		STORAGE_KEY,
		textDirection
	} from '#lib/i18n/config.ts';
	import { pageHref } from '#lib/i18n/index.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { SITE } from '#lib/site.ts';
</script>

<svelte:head>
	<InlineScript
		code={redirect}
		data={{
			basePath: __BASE_PATH__,
			locales: LOCALES.join(','),
			fallback: DEFAULT_LOCALE,
			storageKey: STORAGE_KEY
		}}
	/>
	<title>{m['nav.home']()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- Fallback when JavaScript is off -->
<main class="choose">
	<h1>{SITE.name}</h1>
	<nav aria-label={m['redirect.choose']()}>
		{#each LOCALES as locale (locale)}
			<a href={pageHref('home', locale)} hreflang={locale} lang={locale} dir={textDirection(locale)}
				>{LANGUAGE_NAMES[locale]}</a
			>
		{/each}
	</nav>
</main>

<style>
	.choose {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1.5rem;
		min-block-size: 100dvh;
	}

	h1 {
		color: var(--muted);
		font-size: 1rem;
		letter-spacing: 0.08em;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.25rem 2rem;
		padding: var(--gutter);
	}
</style>
