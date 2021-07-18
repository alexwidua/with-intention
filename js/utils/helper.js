/**
 * @file Helper utility functions
 */

/**
 * Look for the key of a value in a object.
 * @param {Object} object
 * @param {String} value - Value to look for
 * @returns {String || undefined} - Returns key if key for corresponding value is found
 */
function getKey(object, value) {
	return Object.keys(object).find((key) => object[key] === value)
}

/**
 * Generate a unique identifier.
 * @returns {String} - Returns unique identifier
 */
const getUID = function () {
	return Math.random().toString(36).substr(2, 4)
}

export { getKey, getUID }
