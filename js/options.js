import { addUrl, removeUrl } from './utils/url.js'
import {
	createTime,
	toggleTimeFeature,
	toggleTimeFormat,
	setTime
} from './core/time.js'

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

// Add listeners
addItemButton.addEventListener('click', addItem)
addItemInput.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') {
		addItem()
	}
})

timeCheckbox.addEventListener('change', toggleTimeFeature)

timeSwapButton.addEventListener('click', () => {
	toggleTimeFormat((is24Hrs) => {
		const btnContent = is24Hrs
			? 'Show 24 hour format'
			: 'Show 12 hour format'
		timeSwapButton.textContent = btnContent
	})
})

from.addEventListener('change', (e) => {
	setTime(e, () => {
		timeMsg.textContent = 'Updated time.'
		setTimeout(() => {
			timeMsg.textContent = ''
		}, 2000)
	})
})
to.addEventListener('change', (e) => {
	setTime(e, () => {
		timeMsg.textContent = 'Updated time.'
		setTimeout(() => {
			timeMsg.textContent = ''
		}, 2000)
	})
})

// Action :)

chrome.storage.local.get(undefined, ({ sites, time }) => {
	Object.keys(sites).forEach((element, index) => {
		list.appendChild(createItem(element, sites[element]))
	})

	if (time.active) {
		timeWrapper.classList.add('isActive')
		timeCheckbox.checked = true
	}

	let interval, str
	const is24Hrs = time.use24Hrs

	if (is24Hrs) {
		interval = 30
		str = 'it-IT'
		from.appendChild(createTime({ interval, str }))
		to.appendChild(createTime({ interval, str }))
		console.log(createTime({ interval, str }))
	} else {
		interval = 30
		str = 'en-US'
		from.appendChild(createTime({ interval, str }))
		to.appendChild(createTime({ interval, str }))
		console.log(createTime({ interval, str }))
	}

	from.value = time.from
	to.value = time.to

	timeSwapButton.appendChild(
		document.createTextNode(
			is24Hrs ? 'Show 12 hour format' : 'Show 24 hour format'
		)
	)
})
