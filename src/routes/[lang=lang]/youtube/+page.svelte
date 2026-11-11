<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { SITE } from '#lib/site.ts';
</script>

<Page id="youtube">
	<p>{m.placeholder()}</p>
	<p>
		<a class="cta" href={SITE.youtube} rel="noopener external">{m['youtube.cta']()} ↗</a>
	</p>
</Page>

<style>
	.cta {
		display: inline-block;
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(var(--g-3), var(--g-2));
		text-decoration: none;
		box-shadow: var(--shadow);
		transition: border-color 0.2s var(--ease);
	}

	.cta:hover {
		border-color: var(--g-6);
	}
</style>
