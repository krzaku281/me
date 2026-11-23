<script lang="ts">
	import LightCurtain from '#lib/components/LightCurtain.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<section class="hero">
	<LightCurtain />
	<h1>{m['page.home.title']()}</h1>
	<p class="lead">{m['page.home.lead']()}</p>
	<p class="intro">{m['page.home.intro']()}</p>
</section>

<style>
	.hero {
		position: relative;
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
		max-inline-size: 52ch;
	}

	.lead {
		color: var(--text);
		font-size: 1.0625rem;
	}

	.intro {
		color: var(--muted);
	}
</style>
