<script lang="ts">
	import type { Picture } from 'vite-imagetools';

	interface Props {
		/** Import with `?enhanced&w=...`, see src/lib/images/index.ts. */
		src: Picture;
		alt: string;
		/** Display width hint for the browser, used to pick the smallest sufficient file. */
		sizes?: string;
		/** true for an image visible without scrolling (LCP): loads at once, with high priority. */
		priority?: boolean;
		caption?: string;
	}

	let {
		src,
		alt,
		sizes = '(min-width: 48rem) 44rem, calc(100vw - 2.5rem)',
		priority = false,
		caption
	}: Props = $props();
</script>

<figure>
	<enhanced:img
		{src}
		{alt}
		{sizes}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	figure {
		display: grid;
		gap: 0.75rem;
		margin: 0;
	}

	figure :global(img) {
		display: block;
		inline-size: 100%;
		block-size: auto;
		border-radius: var(--radius);
		background: var(--g-3);
		box-shadow: var(--shadow);
		/* Monochrome look, matching the site */
		filter: grayscale(1) contrast(1.05);
	}

	figcaption {
		color: var(--g-6);
		font-size: 0.8125rem;
	}
</style>
