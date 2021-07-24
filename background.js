/**
 * @file Background service worker that watches the browser navigation and
 * injects content scripts if URL matches.
 */

let STORAGE_CACHE

/**
 * Run on install (or update).
 * TODO: Add intro page, add uninstall page
 */
chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.storage.local.set({
			sites: {},
			time: { active: false, use24Hrs: true, from: '09:00', to: '17:00' }
		})
		//chrome.runtime.setUninstallURL('https://example.com/extension-survey');
	}

	const url = chrome.runtime.getURL('onboarding.html')
	chrome.tabs.create({ url })
})

/**
 * Watches for storage changes since storage is cached.
 */
chrome.storage.onChanged.addListener((changes) => {
	for (let [key, { newValue }] of Object.entries(changes)) {
		STORAGE_CACHE[key] = newValue
	}
})

/**
 * Watches for webNavigation events.
 */
chrome.webNavigation.onCommitted.addListener(handleNavigation)

/**
 * Handle webNavigation and inject content script if URL matches.
 * @param {Object} data - Contains properties about webNavigation destination
 */
function handleNavigation(data) {
	const url = new URL(data.url)

	function handleInjection(_data) {
		const { sites, time } = STORAGE_CACHE

		if (time.active) {
			// Compare strings using lexicographic order
			// to allow timeframes between two days (ex: 23:00 to 02:00)
			const now = new Date()
			const h = now.getHours()
			const m = now.getMinutes()
			const hh_mm = `${h < 10 ? '0' + h : h}:${h < 10 ? '0' + m : m}`

			const isActive = time.from < hh_mm && time.to > hh_mm

			if (!isActive) return
		}

		if (Object.values(sites).some((e) => e === url.hostname)) {
			// Inject WebComponents polyfill since Webcomponents are
			// not supported (yet), see: https://bugs.chromium.org/p/chromium/issues/detail?id=390807#c59
			//
			// We also have to inject the polyfill here since executeScript doesn't support modules (yet)
			chrome.scripting.executeScript(
				{
					target: { tabId: _data.tabId },
					files: ['js/polyfills/custom-elements.min.js']
				},
				() => {
					chrome.scripting.executeScript({
						target: { tabId: _data.tabId },
						files: ['js/inject.js']
					})
				}
			)

			chrome.scripting.insertCSS({
				target: { tabId: _data.tabId },
				files: ['style/inject.css']
			})
		}
	}

	if (!STORAGE_CACHE) {
		chrome.storage.local.get(undefined, (storage) => {
			STORAGE_CACHE = storage
			handleInjection(data)
		})
	} else {
		handleInjection(data)
	}
}
