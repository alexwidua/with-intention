let blockedSites

chrome.storage.local.set({
	sites: ['lorem.de', 'ipsum.com', 'dolor.es', 'amet.io']
})

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

read('sites').then((value) => {
	blockedSites = value.sites

	const container = document.getElementById('list')

	blockedSites.forEach((el, i) => {
		let name = document.createElement('li')
		name.textContent = el
		name.id = 'intention-url-' + i

		let deleteField = document.createElement('button')

		deleteField.appendChild(document.createTextNode('Delete'))

		deleteField.onclick = () => deleteUrl(el, i)

		name.appendChild(deleteField)
		container.appendChild(name)
	})
})

function deleteUrl(url, index) {
	const elem = document.getElementById('intention-url-' + index)
	elem.parentNode.removeChild(elem)

	const temp = blockedSites.filter((el) => el !== url)

	console.log(temp)

	chrome.storage.local.set({
		sites: temp
	})
}

function addUrl() {
	const input = document.getElementById('add-url')

	let temp = blockedSites
	temp.push(input.value)
}
