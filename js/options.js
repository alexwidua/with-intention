import { addUrl, removeUrl } from './utils/url.js'

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

// URL item options

const createItem = (id, string = 'example.com') => {
	const item = document.createElement('li')
	item.id = id

	// Set up list item
	const label = document.createElement('label')
	const deleteButton = document.createElement('button')

	label.textContent = string

	deleteButton.appendChild(document.createTextNode('Delete'))
	deleteButton.className = 'delete'
	deleteButton.onclick = deleteItem

	item.appendChild(label)
	item.appendChild(deleteButton)

	return item
}

const addItem = function () {
	const uid = Math.random().toString(36).substr(2, 4)
	const url = addItemInput.value

	addUrl(uid, url)
		.then((response) => {
			if (response) {
				const item = createItem(uid, url)
				list.appendChild(item)
			}
		})
		.catch((e) => {
			console.log(e)
		})
}

const deleteItem = function () {
	const item = this.parentNode
	const parent = item.parentNode
	const input = item.querySelector('input[type=text]')
	const id = item.id

	removeUrl(id)
		.then(() => {
			parent.removeChild(item)
		})
		.catch((e) => {
			console.log(e)
		})
}

// Time stuff

const toggleTime = function () {
	chrome.storage.local.get('time', (response) => {
		const { time } = response
		const isActive = time.active
		time.active = !isActive

		chrome.storage.local.set({ time }, () => {
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
	chrome.storage.logal.get('time', (data) => {
		if (chrome.runtime.lastError) {
			return new Error(chrome.runtime.lastError)
		}

		const { time } = data
		const id = e.target.id[0] === '_' ? e.target.id.slice(1) : e.target.id
		time[id] = e.target.value

		chrome.storage.local.set({ time }, () => {
			if (chrome.runtime.lastError) {
				return new Error(chrome.runtime.lastError)
			}

			console.log('Changed time')
			window[id].value = e.target.value
			window['_' + id].value = e.target.value
			timeMsg.textContent = 'Updated time.'
			setTimeout(() => {
				timeMsg.textContent = ''
			}, 2000)
		})
	})
}

const swapTime = function () {
	chrome.local.storage.get('time', (response) => {
		if (chrome.runtime.lastError) {
			return new Error(chrome.runtime.lastError)
		}
		const { time } = response
		const is24Hrs = time.use24Hrs

		time.use24Hrs = !is24Hrs

		chrome.storage.local.set({ time }, () => {
			if (chrome.runtime.lastError) {
				return new Error(chrome.runtime.lastError)
			}
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

// Action :)

chrome.storage.local.get(undefined, (data) => {
	const { sites, time } = data

	Object.keys(sites).forEach((element, index) => {
		list.appendChild(createItem(element, sites[element]))
	})

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
