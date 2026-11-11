// Inlined on "/" (src/routes/+page.svelte). Picks the language before anything renders:
// choice saved in localStorage > browser languages (de-AT -> de) > default.
(function () {
	var cfg = document.currentScript.dataset;
	var locales = cfg.locales.split(',');
	var lang;
	try {
		lang = localStorage.getItem(cfg.storageKey);
	} catch {
		// storage blocked
	}
	if (locales.indexOf(lang) < 0) {
		lang = cfg.fallback;
		var prefs = navigator.languages || [navigator.language];
		for (var i = 0; i < prefs.length; i++) {
			var code = String(prefs[i]).toLowerCase().split('-')[0];
			if (code === 'iw') code = 'he'; // old code for Hebrew, still sent by some systems
			if (locales.indexOf(code) >= 0) {
				lang = code;
				break;
			}
		}
	}
	location.replace(
		location.pathname.replace(/\/?$/, '/') + lang + '/' + location.search + location.hash
	);
})();
