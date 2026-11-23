<script lang="ts">
	import Certificates from '#lib/components/Certificates.svelte';
	import Page from '#lib/components/Page.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import { images, scans } from '#lib/images/index.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** Personal bests. `iso`: the time as an ISO 8601 duration, for <time datetime>. */
	const records = [
		{ distance: '5 km', time: '17:57', iso: 'PT17M57S', place: 'Mogilno', year: 2020 },
		{ distance: '10 km', time: '37:48', iso: 'PT37M48S', place: 'Namysłów', year: 2020 },
		{
			distance: m['running.records.halfMarathon'](),
			time: '1:26:22',
			iso: 'PT1H26M22S',
			place: 'Swarzędz',
			year: 2017
		},
		{
			distance: m['running.records.marathon'](),
			time: '3:08:48',
			iso: 'PT3H8M48S',
			place: 'Wrocław',
			year: 2015
		}
	];
</script>

<Page id="running">
	<Photo
		src={images.podium}
		alt={m['photo.podium.alt']()}
		caption={m['photo.podium.caption']()}
		priority
	/>

	<div class="prose">
		<p>{m['page.running.body.p1']()}</p>
		<div class="split">
			<!-- The source is only 682 px wide, so it stays at under half the column -->
			<Photo
				src={images.marathon}
				alt={m['photo.marathon.alt']()}
				caption={m['photo.marathon.caption']()}
				sizes="(min-width: 48rem) 19.25rem, calc(100vw - 2.5rem)"
			/>
			<p>{m['page.running.body.p2']()}</p>
		</div>
		<p>{m['page.running.body.p3']()}</p>
		<p>{m['page.running.body.p4']()}</p>
		<p>{m['page.running.body.p5']()}</p>
	</div>

	<section class="records" aria-labelledby="records-heading">
		<h2 id="records-heading" class="section-title">{m['running.records.heading']()}</h2>
		<ul>
			{#each records as record (record.distance)}
				<li>
					<span class="distance">{record.distance}</span>
					<time class="time" datetime={record.iso}>{record.time}</time>
					<span class="where">{record.place} · {record.year}</span>
				</li>
			{/each}
		</ul>
	</section>

	<Certificates
		heading={m['certificates.qualifications']()}
		items={[{ scan: scans.runningInstructor, name: m['certificate.running.instructor']() }]}
	/>
</Page>

<style>
	/* Wide screens: the paragraph flows around the photo. Phones: photo, then paragraph. */
	.split {
		display: grid;
		gap: 1.25em;
	}

	@media (min-width: 48rem) {
		.split {
			display: flow-root;
		}

		.split :global(figure) {
			float: inline-end;
			inline-size: 44%;
			margin-block: 0.35rem 1rem;
			margin-inline-start: 1.75rem;
		}
	}

	.records {
		display: grid;
		gap: 1.5rem;
	}

	/* Four in a row on wide screens, two by two on phones */
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		gap: 0.35rem;
		padding: 1rem 1.1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(var(--g-3), var(--g-2));
		box-shadow: var(--shadow);
	}

	.distance {
		color: var(--g-6);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.time {
		color: var(--strong);
		font-size: 1.5rem;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	.where {
		color: var(--g-7);
		font-size: 0.8125rem;
	}
</style>
