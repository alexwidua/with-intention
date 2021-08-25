/**
 * @file Extension's option page which allows the user to add/delete URLs
 * and set a specific timeframe during which the extension runs/sleeps.
 */

import {
	createTime,
	toggleTimeFeature,
	toggleTimeFormat,
	setTime
} from './utils/time.js'

import { createItem, addItem } from './utils/list.js'

/**
 * Selectors
 */
const url_list = document.querySelector('.url-list')

const add_url_container = document.querySelector('.add-url-container')
const add_url_input = document.querySelector('.add-url-input')
const add_url_button = document.querySelector('.add-url-button')
const add_url_error = document.querySelector('.add-url-error')

const manage_time_toggle = document.querySelector('.manage-time-toggle')
const manage_time_toggle_checkbox = document.querySelector(
	'.manage-time-toggle-checkbox'
)
const time_edit_container = document.querySelector('.time-edit-container')
const time_edit_select = document.querySelector('.time-edit-select')
const time_edit_response = document.querySelector('.time-edit-response')
const time_edit_change_format = document.querySelector(
	'.time-edit-change-format'
)

/**
 * Copy-related
 */
const showFormat = { gb: 'Show 24 hours format', us: 'Show 12 hours format' }

/**
 * Event listeners
 */

add_url_container.addEventListener('submit', (e) =>
	addItem(e, add_url_input.value, ({ message, uid, hostname }) => {
		if (message === 'SUCCESS') {
			const item = createItem(uid, hostname)
			url_list.appendChild(item)
			add_url_input.value = ''
			add_url_error.textContent = ''
		} else {
			add_url_error.textContent = message
		}
	})
)

add_url_input.addEventListener('input', (e) => {
	if (e.currentTarget.value) {
		add_url_button.classList.add('is-visible')
	} else {
		add_url_button.classList.remove('is-visible')
	}
})

manage_time_toggle.addEventListener('mouseenter', () => {
	manage_time_toggle.parentNode.classList.add('hover')
})
manage_time_toggle.addEventListener('mouseleave', () => {
	manage_time_toggle.parentNode.classList.remove('hover')
})

manage_time_toggle_checkbox.addEventListener('change', () =>
	toggleTimeFeature((state) => {
		manage_time_toggle_checkbox.value = state
		time_edit_container.classList.toggle('is-visible')
		manage_time_toggle_checkbox.parentNode.parentNode.classList.toggle(
			'is-visible'
		)
	})
)
time_edit_change_format.addEventListener('click', () => {
	toggleTimeFormat((is24Hrs) => {
		time_edit_change_format.textContent = is24Hrs
			? showFormat.gb
			: showFormat.us
	})
})
time_edit_select.addEventListener('change', (e) => {
	setTime(e, ({ id, index }) => {
		if (index) {
			const el = document.getElementById(id)
			el.value = index
		}
		// TODO: Make more elegant
		time_edit_response.textContent = 'Updated time.'
		setTimeout(() => {
			time_edit_response.textContent = ''
		}, 2000)
	})
})

/**
 * Setup
 */
chrome.storage.local.get(undefined, ({ sites, time }) => {
	Object.keys(sites).forEach((e) => {
		url_list.appendChild(createItem(e, sites[e]))
	})

	const from = document.getElementById('from')
	const to = document.getElementById('to')

	if (time.active) {
		time_edit_container.classList.add('is-visible')
		manage_time_toggle_checkbox.parentNode.parentNode.classList.toggle(
			'is-visible'
		)
		manage_time_toggle_checkbox.checked = true
	}

	let interval, str
	const is24Hrs = time.use24Hrs

	if (is24Hrs) {
		interval = 30
		str = 'en-GB'
		from.appendChild(createTime({ interval, str }))
		to.appendChild(createTime({ interval, str }))
	} else {
		interval = 30
		str = 'en-US'
		from.appendChild(createTime({ interval, str }))
		to.appendChild(createTime({ interval, str }))
	}

	from.value = time.from
	to.value = time.to

	time_edit_change_format.appendChild(
		document.createTextNode(is24Hrs ? showFormat.us : showFormat.gb)
	)
})
