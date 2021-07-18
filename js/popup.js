import { addURL, removeURL } from './utils/storage.js'
import { getKey, getUID } from './utils/helper.js'
import { getCurrentTab, refreshTab } from './utils/tab.js'

let STORAGE_CACHE

// Selectors

const INFO = document.getElementById('popup_msg')
const ADD = document.getElementById('popup_add')
const REMOVE = document.getElementById('popup_remove')

chrome.storage.local.get('sites', (data) => {
	if (chrome.runtime.lastError) {
		return new Error(chrome.runtime.lastError)
	}

	const { sites } = data
	STORAGE_CACHE = sites

	getCurrentTab().then((tab) => {
		let url
		const visible = 'isVisible'

		if (!tab.url) {
			INFO.classList.add(visible)
			return
		} else {
			url = new URL(tab.url)
		}

		if (Object.values(sites).some((e) => e === url.hostname)) {
			const key = getKey(sites, url.hostname)
			REMOVE.addEventListener('click', () =>
				removeURL(key).then(() => refreshTab(() => window.close()))
			)

			REMOVE.classList.add(visible)
		} else {
			const uid = getUID()

			ADD.addEventListener('click', () =>
				addURL(uid, url).then(() => refreshTab(() => window.close()))
			)
			ADD.classList.add(visible)
		}
	})
})
