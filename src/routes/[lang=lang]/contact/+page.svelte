<script lang="ts">
	import { resolve } from '$app/paths';
	import Page from '#lib/components/Page.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { SITE } from '#lib/site.ts';
</script>

<Page id="contact">
	<dl>
		<dt>{m['contact.email']()}</dt>
		<dd><a href="mailto:{SITE.email}">{SITE.email}</a></dd>
		{#if SITE.phone}
			<dt>Tel.</dt>
			<dd><a href="tel:{SITE.phone.replace(/\s/g, '')}">{SITE.phone}</a></dd>
		{/if}
		<dt>YouTube</dt>
		<dd>
			<a href={SITE.youtube} rel="noopener external"
				>{SITE.youtube.replace(/^https?:\/\/(www\.)?/, '')}</a
			>
		</dd>
	</dl>

	<!-- Phones open .vcf files straight in the address book -->
	<a class="vcard" href={resolve('vcard.vcf')} type="text/vcard" data-no-prefetch>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19h14" />
		</svg>
		<span>
			{m['contact.vcard']()}
			<small>{m['contact.vcardHint']()}</small>
		</span>
	</a>
</Page>

<style>
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem 2rem;
		margin: 0;
	}

	dt {
		color: var(--g-6);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		line-height: 2.2;
	}

	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}

	.vcard {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		justify-self: start;
		padding: 0.9rem 1.4rem 0.9rem 1.1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(var(--g-3), var(--g-2));
		box-shadow: var(--shadow);
		text-decoration: none;
		transition:
			border-color 0.2s var(--ease),
			transform 0.2s var(--ease);
	}

	.vcard:hover {
		border-color: var(--g-6);
	}

	.vcard:active {
		transform: translateY(1px);
	}

	.vcard svg {
		inline-size: 1.25rem;
		block-size: 1.25rem;
		fill: none;
		stroke: var(--g-8);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.vcard span {
		display: grid;
		gap: 0.15rem;
	}

	small {
		color: var(--g-6);
		font-size: 0.75rem;
	}
</style>
