import { addURL, removeURL } from './utils/storage.js'
import { getKey, getUID } from './utils/helper.js'
import { getCurrentTab, refreshTab } from './utils/tab.js'

let STORAGE_CACHE

const actionProhibited = document.querySelector('.action-prohibited')
const addWebsite = document.querySelector('.add-website')
const addButton = document.querySelector('.add-button')
const removeWebsite = document.querySelector('.remove-website')
const removeButton = document.querySelector('.remove-button')

chrome.storage.local.get('sites', (data) => {
	if (chrome.runtime.lastError) {
		return new Error(chrome.runtime.lastError)
	}

	const { sites } = data
	STORAGE_CACHE = sites

	getCurrentTab().then((tab) => {
		if (!tab.url) {
			actionProhibited.classList.add(IsVisibleClass)
			return
		}

		const url = new URL(tab.url)
		const IsVisibleClass = 'is-visible'

		addButton.textContent = `Add ${url.hostname}`
		removeButton.textContent = `Remove ${url.hostname}`
		console.log(url)

		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			actionProhibited.classList.add(IsVisibleClass)
			return
		}

		if (Object.values(sites).some((e) => e === url.hostname)) {
			const key = getKey(sites, url.hostname)
			removeButton.addEventListener('click', () =>
				removeURL(key).then(() => refreshTab(() => window.close()))
			)
			removeWebsite.classList.add(IsVisibleClass)
		} else {
			const uid = getUID()

			addButton.addEventListener('click', () =>
				addURL(uid, url).then(() => refreshTab(() => window.close()))
			)
			addWebsite.classList.add(IsVisibleClass)
		}
	})
})
