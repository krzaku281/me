// Plain ES5-style browser script, not type-checked (see tsconfig "exclude").
// Inlined in <head> of the start page by src/lib/components/LightCurtain.svelte, so it runs
// before the first paint. Plays the light-curtain intro once per browser session, unless the
// visitor prefers reduced motion: it only sets data-intro on <html>, CSS does the rest.
(function () {
	try {
		if (sessionStorage.getItem('intro')) return;
		sessionStorage.setItem('intro', '1');
	} catch {
		return; // storage blocked: no intro
	}
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	function play() {
		document.documentElement.setAttribute('data-intro', '');
	}

	// Prerendered on hover (speculation rules): start only once the page is actually shown
	if (document.prerendering) document.addEventListener('prerenderingchange', play, { once: true });
	else play();
})();
