/**
 * @file Handle time feature that allows the user
 * to enable/disable the plugin during certain time periods.
 */

/**
 * Return a collection of <option> nodes from 0:00 to 23:59 o'clock
 * in either 24-hours or 12-hours format.
 * @param {Object} settings
 * @param {Number} settings.interval - Interval of option's, ex. 30 => 0:00, 0:30, 1:00
 * @param {String} settings.str - Date string, 'en-GB' for 24-hour, 'en-US' for 12-hour format
 * @returns {#document-fragment}
 */
const createTime = function ({ interval, str }) {
	const times = (_interval, _str) => {
		const date = new Date(1970, 0, 1)
		let times = []

		while (date.getDate() === 1) {
			let obj = {}
			obj.value = date.toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit'
			})
			obj.txt = date.toLocaleTimeString(_str, {
				hour: '2-digit',
				minute: '2-digit'
			})

			times.push(obj)
			date.setMinutes(date.getMinutes() + _interval)
		}
		return times
	}

	let collection = document.createDocumentFragment()

	times(interval, str).forEach((e) => {
		let option = document.createElement('option')
		option.value = e.value
		option.textContent = e.txt
		collection.appendChild(option)
	})

	return collection
}

/**
 * Enables or disables the time feature.
 * @param {Function} callback
 */
const toggleTimeFeature = function (callback) {
	chrome.storage.local.get('time', ({ time }) => {
		const isActive = time.active
		time.active = !isActive

		chrome.storage.local.set({ time }, () => {
			if (callback && typeof callback === 'function') {
				callback(!isActive)
			}
		})
	})
}

/**
 * Toggles time format between 24-hour and 12-hour format.
 * @param {Function} - Callback function
 */
const toggleTimeFormat = function (callback) {
	chrome.storage.local.get('time', ({ time }) => {
		if (chrome.runtime.lastError) {
			return new Error(chrome.runtime.lastError)
		}

		const is24Hrs = time.use24Hrs
		time.use24Hrs = !is24Hrs

		chrome.storage.local.set({ time }, () => {
			if (chrome.runtime.lastError) {
				return new Error(chrome.runtime.lastError)
			}

			const tempFrom = from.value
			const tempTo = to.value

			while (from.firstChild && to.firstChild) {
				from.firstChild.remove()
				to.firstChild.remove()
			}

			const interval = 30
			const str = is24Hrs ? 'en-US' : 'en-GB'

			from.appendChild(createTime({ interval, str }))
			to.appendChild(createTime({ interval, str }))

			from.value = tempFrom
			to.value = tempTo

			if (callback && typeof callback === 'function') {
				callback(is24Hrs)
			}
		})
	})
}

/**
 * Sets new time and writes time to local store.
 * @param {Event} - Expects input event from <select> field
 * @param {Function} - Callback function
 */
const setTime = function (e, callback) {
	chrome.storage.local.get('time', ({ time }) => {
		if (chrome.runtime.lastError) {
			return new Error(chrome.runtime.lastError)
		}

		// Expects target id to be 'from' or 'to'
		time[e.target.id] = e.target.value
		let offset
		const otherSelect = e.target.id === 'from' ? 'to' : 'from'

		if (time[e.target.id] === time[otherSelect]) {
			if (e.target.selectedIndex < e.target.length - 1) {
				offset = e.target[e.target.selectedIndex + 1].value
				time[otherSelect] = offset
			} else {
				offset = e.target[e.target.selectedIndex - 1].value
				time[otherSelect] = offset
			}
		}

		chrome.storage.local.set({ time }, () => {
			if (chrome.runtime.lastError) {
				return new Error(chrome.runtime.lastError)
			}

			if (callback && typeof callback === 'function') {
				callback({ id: otherSelect, index: offset })
			}
		})
	})
}

export { createTime, toggleTimeFeature, toggleTimeFormat, setTime }
