<script lang="ts">
	import { ICON_PATH, ICON_SIZE } from '#lib/brand.ts';
	import { navLabel, pageHref } from '#lib/i18n/index.ts';
	import type { Locale } from '#lib/i18n/config.ts';
	import { NAVIGATION, type PageId } from '#lib/i18n/routes.ts';
	import { m } from '#lib/paraglide/messages.js';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	// Rendered to plain HTML (no client JS). Mobile menu: native popover.
	// Groups: native <details>; src/lib/client/site.js only adds hover and outside-click closing.
	let { locale, current }: { locale: Locale; current: PageId | null } = $props();
</script>

<header class="bar">
	<a class="brand" href={pageHref('home', locale)} title={m['ui.home']()}>
		<svg class="mark" viewBox="0 0 {ICON_SIZE} {ICON_SIZE}" aria-hidden="true">
			<path d={ICON_PATH} />
		</svg>
		<span class="prompt" aria-hidden="true">~/</span>{navLabel('home').toLowerCase()}
	</a>

	<button class="toggle" type="button" popovertarget="main-nav" aria-label={m['ui.menu']()}>
		<span class="burger" aria-hidden="true"></span>
	</button>

	<nav id="main-nav" class="nav" popover aria-label={m['ui.mainNav']()}>
		<ul class="menu">
			{#each NAVIGATION as item (item.id)}
				{#if item.kind === 'page'}
					<li>
						<a
							class="link"
							href={pageHref(item.id, locale)}
							aria-current={current === item.id ? 'page' : undefined}>{navLabel(item.id)}</a
						>
					</li>
				{:else}
					{@const active = current !== null && item.children.includes(current)}
					<li class="group">
						<details name="nav" data-menu data-hover>
							<summary class="link" class:active>
								{navLabel(item.id)}<span class="chevron" aria-hidden="true"></span>
							</summary>
							<ul class="sub">
								{#each item.children as child (child)}
									<li>
										<a
											href={pageHref(child, locale)}
											aria-current={current === child ? 'page' : undefined}>{navLabel(child)}</a
										>
									</li>
								{/each}
							</ul>
						</details>
					</li>
				{/if}
			{/each}
		</ul>

		<LanguageSwitcher {locale} {current} />
	</nav>
</header>

<style>
	.bar {
		position: sticky;
		inset-block-start: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 1rem var(--gutter);
		background: rgb(12 12 12 / 0.72);
		backdrop-filter: blur(14px) saturate(0);
		border-block-end: 1px solid rgb(255 255 255 / 0.05);
		/* Stays put during page transitions */
		view-transition-name: site-header;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		color: var(--strong);
		text-decoration: none;
		letter-spacing: 0.02em;
	}

	/* 16 px = the 32-unit grid at 2 device px per unit on HiDPI screens: crisp edges */
	.mark {
		inline-size: 16px;
		block-size: 16px;
		shape-rendering: crispEdges;
		margin-inline-end: 0.75rem;
		fill: var(--g-8);
		transition: fill 0.2s var(--ease);
	}

	.brand:hover .mark {
		fill: var(--g-9);
	}

	.prompt {
		color: var(--g-6);
		/* "~/" is a path: keep it left-to-right on RTL pages too */
		direction: ltr;
		unicode-bidi: isolate;
	}

	.menu,
	.sub {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.4rem 0.7rem;
		border-radius: var(--radius);
		color: var(--muted);
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		user-select: none;
		transition:
			color 0.2s var(--ease),
			background-color 0.2s var(--ease);
	}

	summary {
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.link:hover,
	details[open] > .link {
		color: var(--strong);
		background: rgb(255 255 255 / 0.04);
	}

	.link[aria-current='page'],
	.link.active {
		color: var(--strong);
	}

	.chevron {
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

	.group {
		position: relative;
	}

	.sub a {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: calc(var(--radius) - 0.15rem);
		color: var(--text);
		font-size: 0.875rem;
		text-decoration: none;
		transition:
			background-color 0.15s var(--ease),
			color 0.15s var(--ease);
	}

	.sub a:hover {
		background: rgb(255 255 255 / 0.05);
		color: var(--strong);
	}

	.sub a[aria-current='page'] {
		color: var(--strong);
		background: rgb(255 255 255 / 0.07);
	}

	.toggle {
		display: none;
		inline-size: 2.5rem;
		block-size: 2.5rem;
		margin-inline-end: -0.5rem;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.burger,
	.burger::before,
	.burger::after {
		display: block;
		inline-size: 1.25rem;
		block-size: 1px;
		margin-inline: auto;
		background: var(--strong);
		transition:
			transform 0.25s var(--ease),
			background-color 0.2s var(--ease);
	}

	.burger {
		position: relative;
	}

	.burger::before,
	.burger::after {
		content: '';
		position: absolute;
	}

	.burger::before {
		transform: translateY(-0.4rem);
	}

	.burger::after {
		transform: translateY(0.4rem);
	}

	.bar:has(.nav:popover-open) .burger {
		background: transparent;
	}

	.bar:has(.nav:popover-open) .burger::before {
		transform: rotate(45deg);
	}

	.bar:has(.nav:popover-open) .burger::after {
		transform: rotate(-45deg);
	}

	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-0.25rem);
		}
	}

	/* Desktop: the popover is just an always-visible inline nav. */
	@media (min-width: 56.01rem) {
		.nav {
			position: static;
			display: flex;
			align-items: center;
			gap: 1.5rem;
			inline-size: auto;
			block-size: auto;
			margin: 0;
			padding: 0;
			border: 0;
			overflow: visible;
			color: inherit;
			background: none;
		}

		.menu {
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}

		.sub {
			position: absolute;
			inset-block-start: calc(100% + 0.5rem);
			inset-inline-start: 0;
			min-inline-size: 13rem;
			padding: 0.4rem;
			border: 1px solid var(--line);
			border-radius: var(--radius);
			background: linear-gradient(var(--g-3), var(--g-2));
			box-shadow: var(--shadow);
			animation: drop 0.18s var(--ease);
		}

		/* Invisible bridge over the gap above the dropdown, as wide as the dropdown. It is part
		   of <details>, so the pointer never "leaves" while travelling to an item. */
		.sub::before {
			content: '';
			position: absolute;
			inset-inline: 0;
			inset-block-end: 100%;
			block-size: calc(0.5rem + 2px);
		}
	}

	/* Mobile: hamburger opens the nav as a full-height popover panel. */
	@media (max-width: 56rem) {
		.toggle {
			display: block;
		}

		.nav {
			position: fixed;
			inset: 4.25rem 0 0;
			inline-size: auto;
			block-size: auto;
			margin: 0;
			padding: 1.5rem var(--gutter) 2rem;
			border: 0;
			overflow-y: auto;
			color: inherit;
			background: var(--g-1);
			opacity: 0;
			transform: translateY(-0.5rem);
			transition:
				opacity 0.2s var(--ease),
				transform 0.2s var(--ease),
				display 0.2s allow-discrete,
				overlay 0.2s allow-discrete;
		}

		.nav:popover-open {
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			gap: 0;
			opacity: 1;
			transform: none;
		}

		@starting-style {
			.nav:popover-open {
				opacity: 0;
				transform: translateY(-0.5rem);
			}
		}

		.nav::backdrop {
			background: none;
		}

		.menu > li {
			border-block-end: 1px solid var(--g-3);
		}

		.link {
			display: flex;
			inline-size: 100%;
			justify-content: space-between;
			padding: 1rem 0;
			font-size: 0.9375rem;
		}

		.link:hover,
		details[open] > .link {
			background: none;
		}

		.sub {
			padding: 0 0 0.75rem;
			animation: drop 0.18s var(--ease);
		}

		.sub a {
			padding: 0.55rem 1rem;
		}
	}

	/* Very old browsers without popover: show the menu below the header. */
	@supports not selector(:popover-open) {
		@media (max-width: 56rem) {
			.bar {
				flex-wrap: wrap;
			}

			.toggle {
				display: none;
			}

			.nav {
				position: static;
				display: flex;
				flex-direction: column;
				inline-size: 100%;
				padding: 0;
				opacity: 1;
				transform: none;
			}
		}
	}
</style>
