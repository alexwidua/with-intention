/**
 * @file Utility functions to interact with (active) chrome tab.
 */

/**
 * Return current/active tab.
 * @returns {Object} - Returns queryInfo object with properties about current tab
 */
const getCurrentTab = async function () {
	let queryOptions = { active: true, currentWindow: true }
	let [tab] = await chrome.tabs.query(queryOptions)
	return tab
}

/**
 * Refreshes current/active tab.
 * @param {Function} callback
 */
const refreshTab = function (callback) {
	chrome.tabs.reload(() => {
		if (callback && typeof callback === 'function') {
			callback()
		}
	})
}

export { getCurrentTab, refreshTab }
