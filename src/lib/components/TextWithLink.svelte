<script lang="ts">
	/**
	 * A translated sentence with one link inside, without {@html}. The message marks the link's
	 * place with a {link} parameter, e.g. "…met {link}, now my friend." The link text is a
	 * separate message, so each language can inflect it (Polish: "Agnieszką Panderską").
	 */
	interface Props {
		text: (inputs: { link: string }) => string;
		label: string;
		href: string;
	}

	let { text, label, href }: Props = $props();

	// A private-use character cannot occur in real text, so the split is unambiguous
	const MARK = '\u{E000}';
	const parts = $derived(text({ link: MARK }).split(MARK));
</script>

{parts[0]}<a {href} rel="noopener external">{label}</a>{parts[1] ?? ''}
