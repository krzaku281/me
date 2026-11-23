<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import { images } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';

	const FACEBOOK = 'https://www.facebook.com/ksgepardkepno/';
</script>

<Page id="club">
	{#snippet logo()}
		<enhanced:img
			class="logo"
			src={images.clubLogo}
			alt={m['photo.clubLogo']()}
			sizes="4.5rem"
			decoding="async"
		/>
	{/snippet}

	{#snippet actions()}
		<a class="cta" href={FACEBOOK} rel="noopener external">{m['club.cta']()} ↗</a>
	{/snippet}

	<Photo
		src={images.club}
		alt={m['photo.club.alt']()}
		caption={m['photo.club.caption']()}
		priority
	/>

	<div class="prose">
		<p>{m['page.club.body.p1']()}</p>
		<p>{m['page.club.body.p2']()}</p>
		<p>{m['page.club.body.p3']()}</p>
	</div>
</Page>

<style>
	.logo {
		display: block;
		inline-size: clamp(3.5rem, 2.5rem + 4vw, 4.5rem);
		block-size: auto;
		border-radius: 0.75rem;
		box-shadow: var(--shadow);
	}
</style>
