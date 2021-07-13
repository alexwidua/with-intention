function read(key) {
	return new Promise((resolve, reject) => {
		if (key != null) {
			chrome.storage.local.get(key, function (obj) {
				resolve(obj)
			})
		} else {
			reject(null)
		}
	})
}

function write(key) {
	return new Promise((resolve, reject) => {
		if (key != null) {
			chrome.storage.local.set(key, function (obj) {
				resolve(obj)
			})
		} else {
			reject(null)
		}
	})
}

function extractURL(url) {
	return url.replace(
		/^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
		'$1'
	)
}

//On fresh install or update
chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		write({ sites: { abc: 'example.com' } })
		//chrome.runtime.setUninstallURL('https://example.com/extension-survey');
	}
})

// Act on new navigation
chrome.webNavigation.onCommitted.addListener((data) => {
	const url = extractURL(data.url)

	read('sites').then((response) => {
		if (response.hasOwnProperty('sites')) {
			const { sites } = response

			if (Object.values(sites).includes(url)) {
				console.log('Sucess!')
				chrome.scripting.executeScript({
					target: { tabId: data.tabId, allFrames: true },
					files: ['content.js']
				})
				chrome.scripting.insertCSS({
					target: { tabId: data.tabId },
					files: ['intent-style.css']
				})
			}
		} else {
			console.error(
				"Couldn't fetch items, chrome.storage appears to be empty."
			)
		}
	})
})
