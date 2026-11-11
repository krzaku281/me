<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import site from '#lib/client/site.js?script';
	import InlineScript from '#lib/components/InlineScript.svelte';
	import Nav from '#lib/components/Nav.svelte';
	import { educationOrgs } from '#lib/content/timeline.ts';
	import { pageHref, pageLead, pageTitle } from '#lib/i18n/index.ts';
	import { DEFAULT_LOCALE, LOCALES, OG_LOCALES, STORAGE_KEY, toLocale } from '#lib/i18n/config.ts';
	import { ogImagePath, pageIdFromRouteId } from '#lib/i18n/routes.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { SITE } from '#lib/site.ts';

	let { children } = $props();

	const locale = $derived(toLocale(page.params.lang));
	const current = $derived(pageIdFromRouteId(page.route.id));
	const absolute = (href: string) => new URL(href, page.url.href).href;

	const title = $derived(
		!current || current === 'home' ? SITE.name : `${pageTitle(current)} · ${SITE.name}`
	);
	const description = $derived(
		!current || current === 'home' ? m['site.description']() : pageLead(current)
	);
	const ogImage = $derived(
		current
			? absolute((resolve as (p: string) => string)(ogImagePath(current, locale).slice(1)))
			: ''
	);

	// Prerender same-site pages on hover (~200 ms) or touch, so clicks open instantly.
	// Chrome/Edge only; src/lib/client/site.js prefetches on hover in other browsers.
	const speculationRules = JSON.stringify({
		prerender: [
			{
				where: {
					and: [
						{ href_matches: `${__BASE_PATH__}/*` },
						{ not: { selector_matches: '[download], [rel~="external"], [data-no-prefetch]' } }
					]
				},
				eagerness: 'moderate'
			}
		]
	});

	// Structured data for search engines. "<" is escaped so the JSON cannot close the tag.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: SITE.name,
			givenName: SITE.givenName,
			familyName: SITE.familyName,
			url: absolute(pageHref('home', locale)),
			email: `mailto:${SITE.email}`,
			...(SITE.phone ? { telephone: SITE.phone } : {}),
			image: absolute(resolve('apple-touch-icon.png')),
			sameAs: [SITE.youtube],
			alumniOf: educationOrgs().map((name) => ({ '@type': 'EducationalOrganization', name })),
			memberOf: [{ '@type': 'Organization', name: 'Mensa' }]
		}).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if current}
		<link rel="canonical" href={absolute(pageHref(current, locale))} />
		{#each LOCALES as alt (alt)}
			<link rel="alternate" hreflang={alt} href={absolute(pageHref(current, alt))} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={absolute(pageHref(current, DEFAULT_LOCALE))} />

		<meta property="og:type" content={current === 'home' ? 'profile' : 'website'} />
		<meta property="og:site_name" content={SITE.name} />
		<meta property="og:title" content={title} />
		<meta property="og:description" content={description} />
		<meta property="og:url" content={absolute(pageHref(current, locale))} />
		<meta property="og:locale" content={OG_LOCALES[locale]} />
		{#each LOCALES.filter((l) => l !== locale) as alt (alt)}
			<meta property="og:locale:alternate" content={OG_LOCALES[alt]} />
		{/each}
		<meta property="og:image" content={ogImage} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content={title} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
	<InlineScript type="speculationrules" code={speculationRules} />
	{#if current === 'home'}
		<InlineScript type="application/ld+json" code={jsonLd} />
	{/if}
</svelte:head>

<a class="skip" href="#main">{m['ui.skip']()}</a>

<div class="shell">
	<Nav {locale} {current} />

	<main id="main" tabindex="-1">
		{@render children()}
	</main>

	<footer>
		<span>© {new Date().getFullYear()} {SITE.name}</span>
		<span
			class="perf"
			data-perf
			data-loaded={m['perf.loaded']({ ms: '{ms}', kb: '{kb}' })}
			data-prerendered={m['perf.prerendered']({ kb: '{kb}' })}
			hidden
		>
			<!-- Short form for the eye; the full sentence for screen readers and as a tooltip -->
			<span data-perf-short aria-hidden="true" dir="ltr"></span>
			<span data-perf-full class="visually-hidden"></span>
		</span>
	</footer>
</div>

<InlineScript code={site} data={{ storageKey: STORAGE_KEY, goatcounter: __GOATCOUNTER__ }} />

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-block-size: 100dvh;
	}

	main {
		flex: 1;
		inline-size: 100%;
		max-inline-size: calc(var(--measure) + 2 * var(--gutter));
		margin-inline: auto;
		padding: clamp(3rem, 10vh, 7rem) var(--gutter) 4rem;
		outline: none;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1.5rem;
		padding: 2rem var(--gutter);
		border-block-start: 1px solid rgb(255 255 255 / 0.04);
		color: var(--g-6);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-align: center;
		view-transition-name: site-footer;
	}

	.perf {
		color: var(--g-6);
		font-variant-numeric: tabular-nums;
		animation: fade 0.6s var(--ease);
	}

	.perf[hidden] {
		display: none;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	.skip {
		position: absolute;
		inset-inline-start: 1rem;
		inset-block-start: -3rem;
		z-index: 20;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		background: var(--g-9);
		color: var(--g-0);
		text-decoration: none;
	}

	.skip:focus {
		inset-block-start: 1rem;
	}
</style>
