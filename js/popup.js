async function getCurrentTab() {
	let queryOptions = { active: true, currentWindow: true }
	let [tab] = await chrome.tabs.query(queryOptions)
	return tab
}

let STORAGE_CACHE

const DIV = document.getElementById('popup')

console.log(getCurrentTab())

const init = function () {
	const elem = document.createElement('p')
	const btn = document.createElement('button')

	chrome.storage.local.get('sites', (data) => {
		const { sites } = data
		STORAGE_CACHE = sites

		getCurrentTab().then((tab) => {
			const url = new URL(tab.url)

			// if (!url) {
			// 	elem.textContent = 'You cannot intent this page...'
			// 	DIV.appendChild(elem)
			// } else if (Object.values(sites).includes(url)) {
			// 	btn.appendChild(document.createTextNode('Remove website'))
			// 	DIV.appendChild(btn)
			// } else {
			// 	btn.appendChild(document.createTextNode('Add website'))
			// 	DIV.appendChild(btn)
			// }
		})
	})
}

init()
