<script lang="ts">
	import Certificates from '#lib/components/Certificates.svelte';
	import Page from '#lib/components/Page.svelte';
	import TextWithLink from '#lib/components/TextWithLink.svelte';
	import { scans } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Page id="reiki">
	<div class="prose">
		<p>
			<TextWithLink
				text={(inputs) => m['page.reiki.body.p1'](inputs)}
				label={m['page.reiki.body.p1Link']()}
				href="https://www.sciezkamiserca.pl/"
			/>
		</p>
		<p>{m['page.reiki.body.p2']()}</p>
		<p>{m['page.reiki.body.p3']()}</p>
	</div>

	<Certificates
		items={[
			{ scan: scans.reiki1, name: m['certificate.reiki.level1']() },
			{ scan: scans.reiki2, name: m['certificate.reiki.level2']() }
		]}
	/>
</Page>
