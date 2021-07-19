/**
 * @file Utility functions to add or remove a URL from chrome.storage.local.
 * TODO: Sync storage instead of local
 */

import { getKey } from '../utils/helper.js'

/**
 * Write URL to local chrome storage.
 * @param {String} id
 * @param {String} url - URL that will be added to store.
 * @returns Promise if read/write operation succeded and permission was granted
 */
const addURL = function addURLToStorage(id, url) {
	return new Promise((resolve, reject) => {
		let _url
		try {
			_url = new URL(url)
		} catch {
			return reject(new Error('Not a valid URL.'))
		}

		chrome.storage.local.get('sites', ({ sites }) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError)
			}

			if (getKey(sites, _url.hostname) !== undefined) {
				return reject(new Error('URL has already been added.'))
			} else {
				chrome.permissions.request(
					{
						permissions: ['scripting'],
						origins: [_url.origin + '/']
					},
					function (granted) {
						if (granted) {
							sites[id] = _url.hostname

							chrome.storage.local.set({ sites }, () => {
								if (chrome.runtime.lastError) {
									return reject(chrome.runtime.lastError)
								}
								console.log(
									'Added' +
										url +
										'with ID' +
										id +
										'to storage.'
								)

								resolve(_url.hostname)
							})
						} else {
							reject(new Error('Failed to grant permission.'))
						}
					}
				)
			}
		})
	})
}

/**
 * Remove a URL from local chrome storage.
 * @param {String} id - ID of URL that will be removed from store
 * @returns Promise if read and write operation succeded
 */
const removeURL = function removeURLFromStorage(id) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('sites', ({ sites }) => {
			const url = sites[id]

			delete sites[id]

			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError)
			}

			chrome.storage.local.set({ sites }, () => {
				if (chrome.runtime.lastError) {
					return reject(chrome.runtime.lastError)
				}
				console.log('Removed' + url + 'with ID' + id + 'from storage.')

				resolve(true)
			})
		})
	})
}

export { addURL, removeURL }
