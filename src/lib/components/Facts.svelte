<script lang="ts">
	/** Key facts in one line, e.g. years · school · title. Wraps on narrow screens. */
	let { items }: { items: readonly string[] } = $props();
</script>

<ul>
	{#each items as item (item)}
		<li>{item}</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0;
		margin: 0;
		padding: 0;
		list-style: none;
		color: var(--g-8);
		font-size: 0.875rem;
	}

	/* After each item, so a wrapped line never starts with a separator */
	li:not(:last-child)::after {
		content: '·';
		padding-inline: 0.75em;
		color: var(--g-6);
	}
</style>
