<script lang="ts">
	import Facts from '#lib/components/Facts.svelte';
	import Page from '#lib/components/Page.svelte';
	import { images } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Page id="mensa">
	{#snippet actions()}
		<Facts items={['2025', 'Mensa Polska', m['page.mensa.facts.role']()]} />
	{/snippet}

	<!-- Card size on the page (the source is 662 px wide); loads first, so no lazy loading -->
	<enhanced:img
		class="card"
		src={images.mensaCard}
		alt={m['photo.mensaCard']()}
		sizes="(min-width: 30rem) 22rem, calc(100vw - 2.5rem)"
		fetchpriority="high"
		decoding="async"
	/>

	<div class="prose">
		<p>{m['page.mensa.body.p1']()}</p>
		<p>{m['page.mensa.body.p2']()}</p>
		<p>{m['page.mensa.body.p3']()}</p>
		<p>{m['page.mensa.body.p4']()}</p>
	</div>
</Page>

<style>
	/* Like the real card: rounded corners (about 25 px on a 662 × 418 card) and a shadow */
	.card {
		display: block;
		inline-size: min(100%, 22rem);
		block-size: auto;
		border-radius: 3.8% / 6%;
		box-shadow:
			0 0 0 1px var(--line),
			var(--shadow);
	}
</style>
