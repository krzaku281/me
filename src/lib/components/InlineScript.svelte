<script lang="ts">
	interface Props {
		/** Script source, imported with `?script` (minified at build). */
		code: string;
		/** Becomes data-* attributes, readable via document.currentScript.dataset. */
		data?: Record<string, string>;
		/** For non-JS script types such as "speculationrules". */
		type?: string;
	}

	let { code, data = {}, type }: Props = $props();

	const escapeAttr = (value: string) =>
		value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
	const toKebab = (key: string) => key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

	const html = $derived.by(() => {
		const attrs = Object.entries(data)
			.map(([key, value]) => ` data-${toKebab(key)}="${escapeAttr(value)}"`)
			.join('');
		const typeAttr = type ? ` type="${escapeAttr(type)}"` : '';
		// Neither our sources nor JSON with "<" escaped can contain "</script".
		return `<script${typeAttr}${attrs}>${code.replace(/<\/script/gi, '<\\/script')}</` + 'script>';
	});
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted build-time code, attributes escaped -->
{@html html}
