// chrome.webNavigation.onCompleted.addListener(function (data) {
// 	console.log('Fired yo ' + data.url)
// 	if (
// 		data.url.search(
// 			/twitch.tv[\/](?!(directory|downloads|friends|inventory|jobs|p|payments|settings|subscriptions|turbo))/
// 		) > 0
// 	) {
// 		console.log('Sucess!')
// 		chrome.scripting.executeScript({
// 			target: { tabId: data.tabId, allFrames: true },
// 			files: ['content.js']
// 		})
// 	}
// })

// chrome.runtime.onInstalled.addListener(() => {
// 	chrome.storage.local.set({ key: 'value123' })
// })

chrome.webNavigation.onCommitted.addListener(function (data) {
	console.log('Fired yo ' + data.url)
	if (data.url.search(/linda-kraft/) > 0) {
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
})
