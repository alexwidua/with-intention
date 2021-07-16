const addUrl = function (id, url) {
	return new Promise((resolve, reject) => {
		let _url
		try {
			_url = new URL(url)
		} catch {
			return reject(new Error('Not a valid URL.'))
		}

		chrome.storage.local.get('sites', (response) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError)
			}

			chrome.permissions.request(
				{
					permissions: ['scripting'],
					origins: [_url.origin + '/']
				},
				function (granted) {
					if (granted) {
						const { sites } = response
						sites[id] = _url.hostname

						chrome.storage.local.set({ sites }, () => {
							if (chrome.runtime.lastError) {
								return reject(chrome.runtime.lastError)
							}
							console.log(
								'Added' + url + 'with ID' + id + 'to storage.'
							)

							resolve(true)
						})
					} else {
						reject(new Error('Failed to grant permission.'))
					}
				}
			)
		})
	})
}

const removeUrl = function (id) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('sites', (response) => {
			const { sites } = response
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

export { addUrl, removeUrl }
