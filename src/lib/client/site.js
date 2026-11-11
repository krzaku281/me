// Plain ES5-style browser script, not type-checked (see tsconfig "exclude").
// The only JavaScript on the site. Inlined (minified) at the end of every page by
// src/routes/[lang=lang]/+layout.svelte. Everything still works without it.
// Settings come from data-* attributes on this <script> element.
(function () {
	var script = document.currentScript;
	var cfg = script ? script.dataset : {};
	var d = document;

	// 1. Remember a language picked by hand (read by the redirect on "/").
	d.addEventListener('click', function (e) {
		var a = e.target.closest && e.target.closest('a[data-lang]');
		if (!a) return;
		try {
			localStorage.setItem(cfg.storageKey, a.dataset.lang);
		} catch {
			// storage blocked: the link still works
		}
	});

	// 2. Dropdowns are native <details name="nav">. All of them [data-menu] close on an
	//    outside click and on Escape; menu groups [data-hover] also open on mouse hover.
	var menus = [].slice.call(d.querySelectorAll('details[data-menu]'));
	var groups = menus.filter(function (det) {
		return det.hasAttribute('data-hover');
	});
	var hover = matchMedia('(hover: hover) and (min-width: 56.01rem)');

	var CLOSE_DELAY = 300; // ms: forgives imprecise mouse paths and brief overshoots

	groups.forEach(function (det) {
		var timer;
		det.addEventListener('pointerenter', function (e) {
			if (!hover.matches || e.pointerType !== 'mouse') return;
			clearTimeout(timer);
			det.open = true; // name="nav" closes any other open group
		});
		det.addEventListener('pointerleave', function (e) {
			if (!hover.matches || e.pointerType !== 'mouse') return;
			timer = setTimeout(function () {
				det.open = false;
			}, CLOSE_DELAY);
		});
		// With hover active a mouse click on the label would just close the menu again.
		det.querySelector('summary').addEventListener('click', function (e) {
			if (hover.matches && e.detail > 0 && det.open) e.preventDefault();
		});
	});

	d.addEventListener('click', function (e) {
		menus.forEach(function (det) {
			if (det.open && !det.contains(e.target)) det.open = false;
		});
	});

	d.addEventListener('keydown', function (e) {
		if (e.key !== 'Escape') return;
		menus.forEach(function (det) {
			if (!det.open) return;
			det.open = false;
			det.querySelector('summary').focus();
		});
	});

	// 3. Browsers without Speculation Rules (Firefox, Safari): prefetch a page on hover.
	if (!(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) {
		var done = {};
		var prefetch = function (e) {
			var a = e.target.closest && e.target.closest('a[href]');
			if (
				!a ||
				a.origin !== location.origin ||
				a.hasAttribute('download') ||
				a.hasAttribute('data-no-prefetch')
			)
				return;
			var url = a.href.split('#')[0];
			if (done[url] || url === location.href.split('#')[0]) return;
			done[url] = 1;
			var link = d.createElement('link');
			link.rel = 'prefetch';
			link.href = url;
			d.head.appendChild(link);
		};
		d.addEventListener('pointerover', prefetch, { passive: true });
		d.addEventListener('touchstart', prefetch, { passive: true });
		d.addEventListener('focusin', prefetch);
	}

	// Runs fn once the page is actually shown (speculation rules may prerender it in the background).
	function whenVisible(fn) {
		if (d.prerendering) d.addEventListener('prerenderingchange', fn, { once: true });
		else fn();
	}

	function afterLoad(fn) {
		if (d.readyState === 'complete') setTimeout(fn);
		else
			addEventListener(
				'load',
				function () {
					setTimeout(fn);
				},
				{ once: true }
			);
	}

	// 4. "This page loaded in N ms" in the footer, from the Navigation Timing API.
	var perf = d.querySelector('[data-perf]');
	if (perf && window.performance && performance.getEntriesByType) {
		afterLoad(function () {
			whenVisible(function () {
				var nav = performance.getEntriesByType('navigation')[0];
				if (!nav) return;
				var bytes = nav.encodedBodySize || 0;
				performance.getEntriesByType('resource').forEach(function (r) {
					if (r.initiatorType !== 'beacon') bytes += r.encodedBodySize || 0;
				});
				var kb = (bytes / 1024).toFixed(1);
				var start = nav.activationStart || 0;
				var ms = Math.round(nav.loadEventEnd - start);
				var text =
					start > 0 && ms <= 0
						? perf.dataset.prerendered
						: perf.dataset.loaded.replace('{ms}', String(Math.max(ms, 1)));
				perf.textContent = text.replace('{kb}', kb);
				perf.hidden = false;
			});
		});
	}

	// 5. GoatCounter page view: one beacon, no cookies, no third-party script.
	var endpoint = cfg.goatcounter;
	if (endpoint) {
		var target = new URL(endpoint, location.href);
		var local = /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname);
		// Skip dev/preview runs on this machine unless the endpoint itself is local (tests).
		if (!local || target.host === location.host) {
			whenVisible(function () {
				var q = {
					p: location.pathname,
					t: d.title,
					r: d.referrer,
					s: screen.width,
					q: location.search,
					b: navigator.webdriver ? 153 : '',
					rnd: Math.random().toString(36).slice(2, 7)
				};
				for (var k in q) if (q[k] !== '') target.searchParams.set(k, q[k]);
				if (!(navigator.sendBeacon && navigator.sendBeacon(target.href)))
					new Image().src = target.href;
			});
		}
	}
})();
