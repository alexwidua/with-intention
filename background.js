let STORAGE_CACHE

//On fresh install or update
chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.storage.local.set({
			sites: {},
			time: { active: false, use24Hrs: true, from: '09:00', to: '17:00' }
		})
		//chrome.runtime.setUninstallURL('https://example.com/extension-survey');
	}
})

chrome.storage.onChanged.addListener((changes) => {
	for (let [key, { newValue }] of Object.entries(changes)) {
		STORAGE_CACHE[key] = newValue
	}
})

chrome.webNavigation.onCompleted.addListener(handleNavigation)

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
			chrome.scripting.executeScript({
				target: { tabId: _data.tabId },
				files: ['js/container.js']
			})
			chrome.scripting.insertCSS({
				target: { tabId: _data.tabId },
				files: ['style/container.css']
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
