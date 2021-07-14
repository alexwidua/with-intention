'use strict'

// Selectors

const list = document.getElementById('list')
const addItemInput = document.getElementById('add-input')
const addItemButton = document.getElementById('add-button')

// chrome.storage.local.set({
// 	sites: ['lorem.de', 'ipsum.com', 'dolor.es', 'amet.io']
// })

// chrome.storage.local.set({
// 	sites: { abc: 'lorem.de', def: 'ipsum.io', ghi: 'dolor.es' }
// })

function read(key) {
	return new Promise((resolve, reject) => {
		if (key != null) {
			chrome.storage.local.get(key, function (obj) {
				resolve(obj)
			})
		} else {
			reject(null)
		}
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

const addItem = function () {
	read('sites').then((response) => {
		if (response.hasOwnProperty('sites')) {
			const uid = Math.random().toString(36).substr(2, 4)
			const url = extractURL(addItemInput.value)
			const { sites } = response

			if (!Object.values(sites).includes(url)) {
				sites[uid] = url
				write({ sites })
					.then(() => {
						console.log('Added to store')
						const item = createItem(uid, url)
						list.appendChild(item)
					})
					.then(() => (addItemInput.value = ''))
			} else {
				console.log('Failed adding item. Duplicate URL')
			}
		} else {
			console.error(
				"Couldn't add item, chrome.storage appears to be empty."
			)
		}
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

// Time

const createTime = function () {
	function generate_times(step) {
		const date = new Date(1970, 0, 1)
		const times = []
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

			date.setMinutes(date.getMinutes() + step)
		}
		return times
	}
}

// Add listeners
addItemButton.addEventListener('click', addItem)
addItemInput.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') {
		addItem()
	}
})

// Render initial list
read('sites').then((response) => {
	if (response.hasOwnProperty('sites')) {
		const { sites } = response

		Object.keys(sites).forEach((element, index) => {
			list.appendChild(createItem(element, sites[element]))
		})
	}
})
