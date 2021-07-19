import {
	createTime,
	toggleTimeFeature,
	toggleTimeFormat,
	setTime
} from './core/time.js'

import { createItem, addItem } from './core/list.js'

/**
 * Selectors
 */
const list = document.getElementById('list')
const listInput = document.getElementById('list_input')
const listAdd = document.getElementById('list_add')

const time = document.getElementById('time')
const timeToggle = document.getElementById('time_toggle')
const timeFromTo = document.getElementById('time_select')
const timeMsg = document.getElementById('time_msg')
const timeFormatButton = document.getElementById('time_format')

/**
 * Event listeners that bind form elements since Chrome
 * doesn't allow inline bindings.
 */

listAdd.addEventListener('submit', (e) =>
	addItem(e, listInput.value, ({ uid, hostname }) => {
		const item = createItem(uid, hostname)
		list.appendChild(item)
		listInput.value = ''
	})
)

timeToggle.addEventListener('change', () =>
	toggleTimeFeature((state) => {
		timeToggle.value = state
		time.classList.toggle('isActive')
	})
)

timeFormatButton.addEventListener('click', () => {
	toggleTimeFormat((is24Hrs) => {
		timeFormatButton.textContent = is24Hrs
			? 'Show 24 hour format'
			: 'Show 12 hour format'
	})
})

timeFromTo.addEventListener('change', (e) => {
	setTime(e, ({ id, index }) => {
		if (index) {
			const el = document.getElementById(id)
			el.value = index
		}
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
		time.classList.add('isActive')
		timeToggle.checked = true
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

	timeFormatButton.appendChild(
		document.createTextNode(
			is24Hrs ? 'Show 12 hour format' : 'Show 24 hour format'
		)
	)
})
