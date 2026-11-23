<script lang="ts">
	import Certificates from '#lib/components/Certificates.svelte';
	import Page from '#lib/components/Page.svelte';
	import { scans } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Page id="prana">
	<div class="prose">
		<p>{m['page.prana.body.p1']()}</p>
		<p>{m['page.prana.body.p2']()}</p>
		<p>{m['page.prana.body.p3']()}</p>
		<p>{m['page.prana.body.p4']()}</p>
		<p>{m['page.prana.body.p5']()}</p>
	</div>

	<Certificates items={[{ scan: scans.pranaBasic, name: m['certificate.prana.basic']() }]} />
</Page>
