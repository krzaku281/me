<script lang="ts" module>
	import type { Picture } from 'vite-imagetools';

	export interface Certificate {
		/** A scan from `scans` in src/lib/images/index.ts. */
		scan: { thumb: Picture; full: Picture };
		/** Course or title name: the caption, and part of the alt text. */
		name: string;
	}
</script>

<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	// Rendered to plain HTML (no client JS). The enlarged view is a native popover:
	// Esc, a click outside or the close button hide it. Its image loads only when opened.
	interface Props {
		items: readonly Certificate[];
		/** Section heading; default "Certificates". */
		heading?: string;
	}

	let { items, heading = m['certificates.heading']() }: Props = $props();

	const uid = $props.id();
	// Portrait scans (e.g. Reiki) go three per row, landscape ones (e.g. Prana) two per row;
	// on phones both are one per row. See the grid below.
	const portrait = $derived(items.every(({ scan }) => scan.full.img.h > scan.full.img.w));
	// A single portrait document (e.g. a diploma) gets half the column, not a third
	const single = $derived(items.length === 1);
	const sizes = $derived(
		portrait && !single
			? '(min-width: 48rem) 13.6rem, (min-width: 30rem) calc(50vw - 2.5rem), calc(100vw - 2.5rem)'
			: portrait || !single
				? '(min-width: 48rem) 21.25rem, calc(100vw - 2.5rem)'
				: '(min-width: 48rem) 44rem, calc(100vw - 2.5rem)'
	);
</script>

<section aria-labelledby="{uid}-heading">
	<h2 id="{uid}-heading" class="section-title">{heading}</h2>

	<ul class:portrait class:single>
		{#each items as item, i (item.name)}
			{@const id = `${uid}-${i}`}
			<li>
				<figure>
					<button
						class="thumb"
						type="button"
						popovertarget={id}
						aria-label={m['certificates.open']({ name: item.name })}
					>
						<enhanced:img src={item.scan.thumb} alt="" {sizes} loading="lazy" decoding="async" />
					</button>
					<figcaption>{item.name}</figcaption>
				</figure>

				<div {id} class="viewer" popover role="dialog" aria-label={item.name}>
					<enhanced:img
						src={item.scan.full}
						alt={m['certificates.alt']({ name: item.name })}
						sizes="min(100vw, 80rem)"
						loading="lazy"
						decoding="async"
					/>
					<button
						class="close"
						type="button"
						popovertarget={id}
						popovertargetaction="hide"
						aria-label={m['ui.close']()}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
					</button>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		display: grid;
		gap: 1.5rem;
	}

	/* auto-fit: a single landscape certificate takes the full width, more go two per row */
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 2rem 1.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* auto-fill keeps empty columns: portrait certificates stay one third wide even when
	   there are only two, so adding a third one does not resize the others */
	ul.portrait {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 12rem), 1fr));
	}

	ul.portrait.single {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
	}

	figure {
		display: grid;
		gap: 0.75rem;
		margin: 0;
	}

	.thumb {
		display: block;
		padding: 0;
		border: 0;
		background: none;
		cursor: zoom-in;
	}

	.thumb :global(img) {
		display: block;
		inline-size: 100%;
		block-size: auto;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		transition: transform 0.25s var(--ease);
	}

	.thumb:hover :global(img) {
		transform: translateY(-2px);
	}

	figcaption {
		color: var(--g-7);
		font-size: 0.8125rem;
	}

	.viewer {
		inset: 0;
		margin: auto;
		padding: 0;
		border: 0;
		background: none;
		overflow: visible;
		opacity: 1;
		transition:
			opacity 0.2s var(--ease),
			display 0.2s allow-discrete,
			overlay 0.2s allow-discrete;
	}

	@starting-style {
		.viewer:popover-open {
			opacity: 0;
		}
	}

	.viewer::backdrop {
		background: rgb(0 0 0 / 0.85);
	}

	.viewer :global(img) {
		display: block;
		inline-size: auto;
		block-size: auto;
		max-inline-size: calc(100vw - 2rem);
		max-block-size: calc(100dvh - 2rem);
		border-radius: var(--radius);
	}

	.close {
		position: absolute;
		inset-block-start: 0.5rem;
		inset-inline-end: 0.5rem;
		display: grid;
		place-items: center;
		inline-size: 2.5rem;
		block-size: 2.5rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: rgb(12 12 12 / 0.8);
		cursor: pointer;
	}

	.close svg {
		inline-size: 1.125rem;
		block-size: 1.125rem;
		fill: none;
		stroke: var(--g-9);
		stroke-width: 1.5;
		stroke-linecap: round;
	}
</style>
