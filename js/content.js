const editItem = function () {
	const item = this.parentNode

	const input = item.querySelector('input[type=text]')
	const label = item.querySelector('label')

	const isEditing = item.classList.contains('isEditing')

	// if (input.value) {
	if (isEditing) {
		sessionStorage.setItem('intention', input.value)
		label.textContent = input.value
	} else {
		input.value = label.textContent
	}
	item.classList.toggle('isEditing')
	document.body.classList.toggle('intent-focus')
	// }
}

const container = document.createElement('div')
container.id = 'intent-container'

const label = document.createElement('label')

const input = document.createElement('input')
input.type = 'text'
input.placeholder = 'Input intention here'

const editButton = document.createElement('button')
editButton.appendChild(document.createTextNode('Edit'))
editButton.onclick = editItem

if (!sessionStorage.getItem('intention')) {
	// Show intention
	document.body.classList.add('intent-focus')
	container.classList.add('isEditing')
} else {
	// Set intention
	label.textContent = sessionStorage.getItem('intention')
}

// Append everything
container.appendChild(label)
container.appendChild(input)
container.appendChild(editButton)
document.body.appendChild(container)
