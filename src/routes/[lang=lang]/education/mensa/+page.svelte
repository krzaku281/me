<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import { images } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Page id="mensa">
	<Photo src={images.mensa} alt={m['photo.mensa']()} priority />
</Page>
