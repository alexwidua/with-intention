const storage = [{ hostSuffix: 'stackoverflow.com' }]

chrome.webNavigation.onCommitted.addListener(
	function (e) {
		console.log('Success')
	},
	{ url: storage }
)
