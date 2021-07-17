let STORAGE_CACHE

// Selectors

const INFO = document.getElementById('info')
const ADD = document.getElementById('add')
const REMOVE = document.getElementById('remove')

async function getCurrentTab() {
	let queryOptions = { active: true, currentWindow: true }
	let [tab] = await chrome.tabs.query(queryOptions)
	return tab
}

// const createAction = function (sites, currentTab) {
// 	let item

// 	if (!currentTab.url) {
// 		item = document.createElement('p')
// 		item.textContent = 'You cannot intent this page...'
// 		return item
// 	}

// 	const url = new URL(currentTab.url)

// 	if (Object.values(sites).some((e) => e === url.hostname)) {
// 		item = document.createElement('button')
// 		item.appendChild(document.createTextNode('Remove website'))
// 		return item
// 	} else {
// 		item = document.createElement('button')
// 		item.appendChild(document.createTextNode('Add website'))
// 		return item
// 	}
// }

chrome.storage.local.get('sites', (data) => {
	if (chrome.runtime.lastError) {
		return new Error(chrome.runtime.lastError)
	}

	const { sites } = data
	STORAGE_CACHE = sites

	getCurrentTab().then((tab) => {
		// const { sites } = data
		// DIV.appendChild(createAction(sites, tab))
		let url
		const visible = 'isVisible'

		if (!tab.url) {
			INFO.classList.add(visible)
			return
		} else {
			url = new URL(tab.url)
		}

		if (Object.values(sites).some((e) => e === url.hostname)) {
			REMOVE.classList.add(visible)
		} else {
			ADD.classList.add(visible)
		}
	})
})
