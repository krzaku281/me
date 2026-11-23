<script lang="ts">
	/**
	 * Light curtain on the start page, like an icicle light curtain:
	 * - intro (first visit per session, see src/lib/client/intro.js): strands of light cover
	 *   the screen, light runs down them, then the curtain parts from the middle;
	 * - afterwards a few icicles stay at the top of the page, a drop running down now and then.
	 * Pure CSS on elements rendered at build time; no client JavaScript besides intro.js.
	 * To remove the effect, delete <LightCurtain /> from src/routes/[lang=lang]/+page.svelte.
	 */
	import intro from '#lib/client/intro.js?script';
	import InlineScript from './InlineScript.svelte';

	// Seeded random numbers: the same pattern on every build (no hydration, no flicker)
	function random(seed: number) {
		return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	}

	const between = (r: () => number, min: number, max: number) => min + r() * (max - min);
	const fixed = (n: number) => n.toFixed(2);

	const r1 = random(7);
	const CURTAIN = 44;
	const curtain = Array.from({ length: CURTAIN }, (_, i) => {
		const x = ((i + 0.5) / CURTAIN) * 100 + between(r1, -0.6, 0.6);
		return {
			x: fixed(x),
			side: x < 50 ? -1 : 1,
			length: fixed(between(r1, 38, 96)), // vh
			grow: fixed(between(r1, 0, 0.35)), // s
			speed: fixed(between(r1, 0.75, 1.3)), // s
			drop: fixed(between(r1, 0.2, 0.75)) // s
		};
	});

	const r2 = random(11);
	const ICICLES = 9;
	const icicles = Array.from({ length: ICICLES }, (_, i) => ({
		x: fixed(((i + 0.5) / ICICLES) * 100 + between(r2, -3, 3)),
		length: fixed(between(r2, 1.5, 7)), // rem
		cycle: fixed(between(r2, 5, 10)), // s
		delay: fixed(between(r2, 0.5, 6)) // s
	}));
</script>

<svelte:head>
	<InlineScript code={intro} />
</svelte:head>

<div class="curtain" aria-hidden="true">
	{#each curtain as s, i (i)}
		<span
			class="strand"
			style:--x="{s.x}%"
			style:--side={s.side}
			style:--length="{s.length}vh"
			style:--grow="{s.grow}s"
			style:--speed="{s.speed}s"
			style:--drop="{s.drop}s"
		></span>
	{/each}
</div>

<div class="icicles" aria-hidden="true">
	{#each icicles as s, i (i)}
		<span
			class="strand"
			style:--x="{s.x}%"
			style:--length="{s.length}rem"
			style:--cycle="{s.cycle}s"
			style:--delay="{s.delay}s"
		></span>
	{/each}
</div>

<style>
	/* Cool white light */
	.curtain,
	.icicles {
		--light: 232 242 255;
		pointer-events: none;
	}

	.strand {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: var(--x);
		inline-size: 1px;
		block-size: var(--length);
		overflow: hidden;
		background: linear-gradient(rgb(var(--light) / 0.22), rgb(var(--light) / 0.04));
	}

	/* The drop of light: a short bright tail with a glowing tip */
	.strand::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		block-size: 35%;
		background: linear-gradient(transparent, rgb(var(--light) / 0.95));
		box-shadow: 0 0 6px 1px rgb(var(--light) / 0.55);
		transform: translateY(-100%);
	}

	/* ---- Intro: only when intro.js marked the first visit of the session ---- */

	.curtain {
		display: none;
	}

	:global(html[data-intro]) .curtain {
		display: block;
		position: fixed;
		inset: 0;
		z-index: 30;
		/* Strands moving out must not widen the page (horizontal scrolling) */
		overflow: hidden;
		animation: hide 2.4s linear forwards;
	}

	/* The dark veil behind the strands, fading as the curtain parts */
	:global(html[data-intro]) .curtain::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--g-0);
		animation: veil 2.4s var(--ease) forwards;
	}

	.curtain .strand {
		inline-size: 2px;
		transform-origin: top;
		animation:
			grow 0.7s var(--ease) var(--grow) both,
			part 2.4s cubic-bezier(0.55, 0, 0.75, 0.3) both;
	}

	.curtain .strand::after {
		animation: drop var(--speed) cubic-bezier(0.4, 0, 0.9, 0.6) var(--drop) 2 both;
	}

	@keyframes grow {
		from {
			transform: scaleY(0);
		}
	}

	@keyframes drop {
		to {
			transform: translateY(290%);
		}
	}

	/* Halves move apart from the middle, after the light has run down */
	@keyframes part {
		0%,
		55% {
			translate: 0;
			opacity: 1;
		}
		100% {
			translate: calc(var(--side) * 55vw) 0;
			opacity: 0;
		}
	}

	@keyframes veil {
		0%,
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes hide {
		to {
			visibility: hidden;
		}
	}

	/* ---- Icicles that stay: hanging from the header line above the title ---- */

	.icicles {
		position: absolute;
		/* Up by the top padding of <main> (see src/routes/[lang=lang]/+layout.svelte) */
		inset-block-start: calc(-1 * clamp(3rem, 10vh, 7rem));
		inset-inline: 0;
	}

	.icicles .strand {
		background: linear-gradient(rgb(var(--light) / 0.32), rgb(var(--light) / 0.06));
	}

	/* A drop now and then: runs down in the first 15% of each cycle, then waits */
	.icicles .strand::after {
		animation: drip var(--cycle) cubic-bezier(0.4, 0, 0.9, 0.6) var(--delay) infinite both;
	}

	@keyframes drip {
		0% {
			transform: translateY(-100%);
		}
		15%,
		100% {
			transform: translateY(290%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.icicles .strand::after {
			animation: none;
		}
	}
</style>
