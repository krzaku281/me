<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
</script>

<section class="hero">
	<h1>{m['page.home.title']()}</h1>
	<p>{m['page.home.lead']()}</p>
</section>

<style>
	.hero {
		display: grid;
		gap: 1.5rem;
		padding-block: clamp(2rem, 12vh, 8rem);
	}

	h1 {
		font-size: clamp(3.5rem, 2rem + 9vw, 8rem);
		letter-spacing: -0.06em;
		background: linear-gradient(180deg, var(--g-9) 20%, var(--g-5) 110%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-transform: lowercase;
		view-transition-name: page-title;
	}

	p {
		color: var(--muted);
	}
</style>
