function read(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(
			key !== undefined ? key : undefined,
			function (result) {
				if (Object.values(result)[0] != undefined) {
					resolve(result)
				} else {
					reject()
				}
			}
		)
	})
}

function extractURL(url) {
	return url.replace(
		/^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
		'$1'
	)
}

const initObj = {
	sites: { abc: 'example.com' },
	time: { active: false, use24Hrs: true, from: '09:00', to: '17:00' }
}

//On fresh install or update
chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		write(initObj)
		//chrome.runtime.setUninstallURL('https://example.com/extension-survey');
	}
})

// Act on new navigation
// chrome.webNavigation.onCommitted.addListener((data) => {
// 	doStuff(data)
// })

chrome.webNavigation.onCompleted.addListener(doStuff)

function doStuff(data) {
	const url = data.url
	console.log('Visited' + data.url)

	read().then((response) => {
		// if (response.hasOwnProperty('sites')) {
		const { sites, time } = response

		if (time.active) {
			const tempFrom = time.from.split(':')
			const tempTo = time.to.split(':')

			const now = new Date()
			const from = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				tempFrom[0],
				tempFrom[1]
			)
			const to = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				tempTo[0],
				tempTo[1]
			)

			if (!(now > from && now < to)) {
				return
			}
		}

		if (Object.values(sites).includes(url)) {
			console.log('Sucess!')
			chrome.scripting.executeScript({
				target: { tabId: data.tabId },
				files: ['content.js']
			})
			chrome.scripting.insertCSS({
				target: { tabId: data.tabId },
				files: ['intent-style.css']
			})
		}
	})
}
