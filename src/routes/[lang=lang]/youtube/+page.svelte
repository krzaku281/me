<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import { images } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { SITE } from '#lib/site.ts';
</script>

<Page id="youtube">
	{#snippet actions()}
		<a class="cta" href={SITE.youtube} rel="noopener external">{m['youtube.cta']()} ↗</a>
	{/snippet}

	<Photo
		src={images.house}
		alt={m['photo.house.alt']()}
		caption={m['photo.house.caption']()}
		priority
	/>

	<div class="prose">
		<p>{m['page.youtube.body.p1']()}</p>
		<p>{m['page.youtube.body.p2']()}</p>
		<p>{m['page.youtube.body.p3']()}</p>
		<p>{m['page.youtube.body.p4']()}</p>
	</div>
</Page>
