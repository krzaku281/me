<script lang="ts">
	import Certificates from '#lib/components/Certificates.svelte';
	import Facts from '#lib/components/Facts.svelte';
	import Page from '#lib/components/Page.svelte';
	import { scans } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Page id="engineer">
	{#snippet actions()}
		<Facts items={['2010–2014', 'Politechnika Wrocławska', m['page.engineer.facts.field']()]} />
	{/snippet}

	<div class="prose">
		<p>{m['page.engineer.body.p1']()}</p>
		<p>{m['page.engineer.body.p2']()}</p>
		<p>{m['page.engineer.body.p3']()}</p>
		<p>{m['page.engineer.body.p4']()}</p>
	</div>

	<Certificates
		heading={m['certificates.diploma']()}
		items={[{ scan: scans.engineerDiploma, name: m['certificate.engineer.diploma']() }]}
	/>
</Page>
