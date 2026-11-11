<script lang="ts">
	import { pageHref } from '#lib/i18n/index.ts';
	import { LANGUAGE_NAMES, LOCALES, textDirection, type Locale } from '#lib/i18n/config.ts';
	import type { PageId } from '#lib/i18n/routes.ts';
	import { m } from '#lib/paraglide/messages.js';

	// Native <details> (works without JS), in the same name="nav" group as the menu
	// dropdowns, so only one is open at a time. Desktop: compact "PL" button with a list.
	// Mobile: a row in the menu panel. data-lang: site.js stores a manual choice.
	let { locale, current }: { locale: Locale; current: PageId | null } = $props();
</script>

<details class="lang" name="nav" data-menu>
	<summary>
		<svg class="globe" viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="9" />
			<path
				d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"
			/>
		</svg>
		<span class="visually-hidden">{m['ui.language']()}:</span>
		<span class="code">{locale}</span>
		<span class="name" lang={locale} dir={textDirection(locale)}>{LANGUAGE_NAMES[locale]}</span>
		<span class="chevron" aria-hidden="true"></span>
	</summary>

	<ul class="options">
		{#each LOCALES as option (option)}
			<li>
				<a
					href={pageHref(current ?? 'home', option)}
					hreflang={option}
					data-lang={option}
					aria-current={option === locale ? 'true' : undefined}
				>
					<span lang={option} dir={textDirection(option)}>{LANGUAGE_NAMES[option]}</span>
					<span class="option-code" aria-hidden="true">{option}</span>
				</a>
			</li>
		{/each}
	</ul>
</details>

<style>
	.lang {
		position: relative;
	}

	summary {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.35rem 0.75rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		color: var(--muted);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		list-style: none;
		cursor: pointer;
		user-select: none;
		transition:
			color 0.2s var(--ease),
			border-color 0.2s var(--ease);
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:hover,
	details[open] > summary {
		color: var(--strong);
		border-color: var(--g-5);
	}

	.globe {
		inline-size: 0.95rem;
		block-size: 0.95rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.4;
	}

	.name {
		display: none;
		letter-spacing: normal;
		text-transform: none;
	}

	.chevron {
		display: none;
		inline-size: 0.4em;
		block-size: 0.4em;
		/* physical borders: the arrow points down in RTL too */
		border-right: 1px solid currentColor;
		border-bottom: 1px solid currentColor;
		transform: translateY(-0.15em) rotate(45deg);
		transition: transform 0.2s var(--ease);
	}

	details[open] .chevron {
		transform: translateY(0.1em) rotate(-135deg);
	}

	.options {
		position: absolute;
		inset-block-start: calc(100% + 0.5rem);
		inset-inline-end: 0;
		z-index: 1;
		display: grid;
		min-inline-size: 12rem;
		margin: 0;
		padding: 0.4rem;
		list-style: none;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(var(--g-3), var(--g-2));
		box-shadow: var(--shadow);
		animation: drop 0.18s var(--ease);
	}

	.options a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: calc(var(--radius) - 0.15rem);
		color: var(--text);
		font-size: 0.875rem;
		text-decoration: none;
		transition:
			background-color 0.15s var(--ease),
			color 0.15s var(--ease);
	}

	.options a:hover {
		background: rgb(255 255 255 / 0.05);
		color: var(--strong);
	}

	.options a[aria-current='true'] {
		background: rgb(255 255 255 / 0.07);
		color: var(--strong);
	}

	.option-code {
		color: var(--g-6);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	/* Lighter on the highlighted row to keep 4.5:1 contrast */
	.options a:hover .option-code,
	.options a[aria-current='true'] .option-code {
		color: var(--g-7);
	}

	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-0.25rem);
		}
	}

	/* Mobile: a full-width row in the menu panel, like the other groups */
	@media (max-width: 56rem) {
		.lang {
			border-block-end: 1px solid var(--g-3);
		}

		summary {
			display: flex;
			inline-size: 100%;
			gap: 0.75rem;
			padding: 1rem 0;
			border: 0;
			border-radius: 0;
			font-size: 0.9375rem;
		}

		summary:hover,
		details[open] > summary {
			border-color: transparent;
		}

		.code {
			display: none;
		}

		.name {
			display: inline;
			flex: 1;
		}

		.chevron {
			display: block;
		}

		.options {
			position: static;
			grid-template-columns: 1fr 1fr;
			gap: 0.25rem;
			min-inline-size: 0;
			padding: 0 0 0.75rem;
			border: 0;
			background: none;
			box-shadow: none;
		}

		.options a {
			padding: 0.65rem 1rem;
		}
	}
</style>
