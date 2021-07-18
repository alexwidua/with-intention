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
const LIST = document.getElementById('list')
const LIST_INPUT = document.getElementById('list_input')
const LIST_ADD = document.getElementById('list_add')

const TIME = document.getElementById('time')
const TIME_TOGGLE = document.getElementById('time_toggle')
const TIME_FROM_TO = document.getElementById('time_select')
const TIME_MSG = document.getElementById('time_msg')
const TIME_FORMAT_BTN = document.getElementById('time_format')

/**
 * Event listeners that bind form elements since Chrome
 * doesn't allow inline bindings.
 */

LIST_ADD.addEventListener('submit', (e) =>
	addItem(e, LIST_INPUT.value, ({ uid, hostname }) => {
		const item = createItem(uid, hostname)
		LIST.appendChild(item)
		LIST_INPUT.value = ''
	})
)

TIME_TOGGLE.addEventListener('change', () =>
	toggleTimeFeature((state) => {
		TIME_TOGGLE.value = state
		TIME.classList.toggle('isActive')
	})
)

TIME_FORMAT_BTN.addEventListener('click', () => {
	toggleTimeFormat((is24Hrs) => {
		TIME_FORMAT_BTN.textContent = is24Hrs
			? 'Show 24 hour format'
			: 'Show 12 hour format'
	})
})

TIME_FROM_TO.addEventListener('change', (e) => {
	setTime(e, ({ id, index }) => {
		if (index) {
			const el = document.getElementById(id)
			el.value = index
		}
		TIME_MSG.textContent = 'Updated time.'
		setTimeout(() => {
			TIME_MSG.textContent = ''
		}, 2000)
	})
})

// Action :)

chrome.storage.local.get(undefined, ({ sites, time }) => {
	Object.keys(sites).forEach((element, index) => {
		LIST.appendChild(createItem(element, sites[element]))
	})

	if (time.active) {
		TIME.classList.add('isActive')
		TIME_TOGGLE.checked = true
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

	TIME_FORMAT_BTN.appendChild(
		document.createTextNode(
			is24Hrs ? 'Show 12 hour format' : 'Show 24 hour format'
		)
	)
})
