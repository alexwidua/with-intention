/**
 * @file Provides functionality for the extension's option page.
 */

import { addURL, removeURL } from './storage.js'

/**
 * Creates a LI node containing a name and a delete button.
 * @param {String} id - Unique identifier of URL, used as reference for later deletion/mutation
 * @param {String} str - Text content of the created item
 * @returns {HTMLLIElement} - Returns HTMLLIElement with text and button children.
 */
const createItem = function (id, str) {
	const wrapper = document.createElement('span')
	const item = document.createElement('li')
	item.id = id

	const label = document.createElement('label')
	const deleteButton = document.createElement('button')

	label.textContent = str
	wrapper.appendChild(label)

	deleteButton.appendChild(document.createTextNode('Remove'))
	deleteButton.className = 'delete'
	deleteButton.onclick = removeItem

	item.appendChild(wrapper)
	item.appendChild(deleteButton)

	return item
}

/**
 * Adds new item to the DOM and local storage.
 * @param {Event}
 * @param {String} url - URL of added item
 * @param {Function} callback
 */
const addItem = function (e, url, callback) {
	e.preventDefault()

	const uid = Math.random().toString(36).substr(2, 4)

	addURL(uid, url)
		// Receives hostname property from URL instance
		.then((hostname) => {
			if (hostname) {
				if (callback && typeof callback === 'function') {
					callback({ message: 'SUCCESS', uid, hostname })
				}
			}
		})
		.catch((e) => {
			//TODO: Display proper error message in UI
			console.error(e)
			if (callback && typeof callback === 'function') {
				callback({ message: e.message })
			}
		})
}

/**
 * Removes a item from the DOM and local storage.
 */
const removeItem = function () {
	const item = this.parentNode
	const parent = item.parentNode
	const id = item.id

	removeURL(id)
		.then(() => {
			parent.removeChild(item)
		})
		.catch((e) => {
			console.log(e)
		})
}

export { createItem, addItem, removeItem }
