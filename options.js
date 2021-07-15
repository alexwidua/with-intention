'use strict'

// Selectors
const list = document.getElementById('list')
const addItemInput = document.getElementById('add-input')
const addItemButton = document.getElementById('add-button')

const timeCheckbox = document.getElementById('timeCheckbox')
const timeWrapper = document.getElementById('time')
const timeSwapButton = document.getElementById('swapTime')
const timeMsg = document.getElementById('time_msg')

const from = document.getElementById('from')
const to = document.getElementById('to')

const _from = document.getElementById('_from')
const _to = document.getElementById('_to')

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

// URL item options

const createItem = (id, string = 'example.com') => {
	const item = document.createElement('li')

	// Set up list item
	const label = document.createElement('label')
	const input = document.createElement('input')
	const editButton = document.createElement('button')
	const deleteButton = document.createElement('button')

	label.textContent = string

	input.type = 'text'
	input.id = id

	editButton.appendChild(document.createTextNode('Edit'))
	editButton.className = 'edit'
	editButton.onclick = editItem

	deleteButton.appendChild(document.createTextNode('Delete'))
	deleteButton.className = 'delete'
	deleteButton.onclick = deleteItem

	item.appendChild(label)
	item.appendChild(input)
	item.appendChild(editButton)
	item.appendChild(deleteButton)

	return item
}

// Assume that URL is sanitized
const setItem = function (id, url) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('sites', (response) => {
			// Catch error
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError)
			}

			chrome.permissions.request(
				{
					permissions: ['scripting'],
					origins: [url]
				},
				(granted) => {
					// The callback argument will be true if the user granted the permissions.
					if (granted) {
						const { sites } = response
						sites[id] = url

						chrome.storage.local.set({ sites }, () => {
							// Catch error
							if (chrome.runtime.lastError) {
								return reject(chrome.runtime.lastError)
							}
							console.log('Set value!')

							resolve(true)
						})
					} else {
						console.log(url)
						reject(new Error('Permission denied'))
					}
				}
			)
		})
	})
}

const addItem = function () {
	// read('sites').then((response) => {
	// 	if (response.hasOwnProperty('sites')) {
	// 		const uid = Math.random().toString(36).substr(2, 4)
	// 		const url = extractURL(addItemInput.value)
	// 		const { sites } = response

	// 		if (!Object.values(sites).includes(url)) {
	// 			sites[uid] = url
	// 			write({ sites })
	// 				.then(() => {
	// 					console.log('Added to store')
	// 					const item = createItem(uid, url)
	// 					list.appendChild(item)
	// 				})
	// 				.then(() => (addItemInput.value = ''))
	// 		} else {
	// 			console.log('Failed adding item. Duplicate URL')
	// 		}
	// 	} else {
	// 		console.error(
	// 			"Couldn't add item, chrome.storage appears to be empty."
	// 		)
	// 	}
	// })

	const uid = Math.random().toString(36).substr(2, 4)
	const url = addItemInput.value

	setItem(uid, url).then(() => {
		const item = createItem(uid, url)
		list.appendChild(item)
	})
}

const editItem = function () {
	const item = this.parentNode

	const input = item.querySelector('input[type=text]')
	const label = item.querySelector('label')
	const editButton = item.querySelector('button')

	const isEditing = item.classList.contains('isEditing')

	if (isEditing) {
		// Set value
		read('sites').then((response) => {
			const { sites } = response
			sites[input.id] = input.value
			write({ sites })
				.then(() => {
					console.log('Edited store')
					label.textContent = input.value
					item.classList.remove('isEditing')
				})
				.then(() => (editButton.textContent = 'Edit'))
		})
	} else {
		input.value = label.textContent
		item.classList.add('isEditing')
		editButton.textContent = 'Save'
	}
}

const deleteItem = function () {
	const item = this.parentNode
	const parent = item.parentNode
	const input = item.querySelector('input[type=text]')

	read('sites').then((response) => {
		const id = input.id
		const { sites } = response

		delete sites[id]

		write({ sites }).then(() => {
			console.log('Deleted from store')
			parent.removeChild(item)
		})
	})
}

// Time stuff

const toggleTime = function () {
	read('time').then((response) => {
		const { time } = response
		const isActive = time.active
		time.active = !isActive

		write({ time }).then(() => {
			console.log('Toggled time')
			timeCheckbox.checked = !isActive
			timeWrapper.classList.toggle('isActive')
		})
	})
}

const createTime = function (interval = 30, AM = false) {
	const times = (_interval) => {
		const date = new Date(1970, 0, 1)
		let times = []

		while (date.getDate() === 1) {
			let obj = {}
			obj.value = date.toLocaleTimeString('it-IT', {
				hour: '2-digit',
				minute: '2-digit'
			})
			obj.alt = date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit'
			})

			times.push(obj)
			date.setMinutes(date.getMinutes() + _interval)
		}
		return times
	}

	// const times = generate_times(30)
	let nodelist = document.createDocumentFragment()

	times(interval).forEach((element) => {
		let option = document.createElement('option')
		option.value = element.value
		option.textContent = !AM ? element.value : element.alt
		nodelist.appendChild(option)
	})

	return nodelist
}

const syncTime = function (e) {
	read('time').then((response) => {
		const { time } = response
		const id = e.target.id[0] === '_' ? e.target.id.slice(1) : e.target.id
		time[id] = e.target.value

		write({ time })
			.then(() => {
				console.log('Changed time')
				window[id].value = e.target.value
				window['_' + id].value = e.target.value
			})
			.then(() => {
				timeMsg.textContent = 'Updated time.'
				setTimeout(() => {
					timeMsg.textContent = ''
				}, 2000)
			})
	})
}

const swapTime = function () {
	read('time').then((response) => {
		const { time } = response
		const is24Hrs = time.use24Hrs

		time.use24Hrs = !is24Hrs

		write({ time }).then(() => {
			timeSwapButton.textContent = is24Hrs
				? 'Show 24 hour format'
				: 'Show 12 hour format'
			timeWrapper.classList.toggle('is24Hrs')
		})
	})
}

// Add listeners
addItemButton.addEventListener('click', addItem)
addItemInput.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') {
		addItem()
	}
})

timeCheckbox.addEventListener('change', toggleTime)
timeSwapButton.addEventListener('click', swapTime)
from.addEventListener('change', syncTime)
_from.addEventListener('change', syncTime)
to.addEventListener('change', syncTime)
_to.addEventListener('change', syncTime)

// Render initial list & time
read('sites').then((response) => {
	if (response.hasOwnProperty('sites')) {
		const { sites } = response

		Object.keys(sites).forEach((element, index) => {
			list.appendChild(createItem(element, sites[element]))
		})
	}
})

read('time').then((response) => {
	const { time } = response

	if (time.active) {
		timeWrapper.classList.add('isActive')
		timeCheckbox.checked = true
	}

	from.appendChild(createTime(30))
	to.appendChild(createTime(30))
	_from.appendChild(createTime(30, true))
	_to.appendChild(createTime(30, true))

	from.value = time.from
	to.value = time.to
	_from.value = from.value
	_to.value = to.value

	if (time.use24Hrs) {
		timeWrapper.classList.add('is24Hrs')
	}
	timeSwapButton.appendChild(
		document.createTextNode(
			time.use24Hrs ? 'Show 12 hour format' : 'Show 24 hour format'
		)
	)
})
