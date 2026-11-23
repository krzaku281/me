<script lang="ts">
	import Certificates from '#lib/components/Certificates.svelte';
	import Facts from '#lib/components/Facts.svelte';
	import Page from '#lib/components/Page.svelte';
	import { scans } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Page id="technician">
	{#snippet actions()}
		<Facts
			items={['2004–2008', m['page.technician.facts.school'](), m['page.technician.facts.title']()]}
		/>
	{/snippet}

	<div class="prose">
		<p>{m['page.technician.body.p1']()}</p>
		<p>{m['page.technician.body.p2']()}</p>
		<p>{m['page.technician.body.p3']()}</p>
	</div>

	<Certificates
		heading={m['certificates.diploma']()}
		items={[{ scan: scans.technicianDiploma, name: m['certificate.technician.diploma']() }]}
	/>
</Page>
