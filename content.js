var storedIntention = sessionStorage.getItem('intention')

function init() {
	const wrapper = document.createElement('div')
	wrapper.id = 'intent-wrapper'

	const container = document.createElement('div')
	container.id = 'intent-container'
	wrapper.appendChild(container)

	document.body.prepend(wrapper)

	if (storedIntention) {
		showIntention(container, storedIntention)
	} else {
		showInput(container)
	}
}

function showIntention(parent, value) {
	parent.parentNode.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'

	const intentionWrapper = document.createElement('div')
	intentionWrapper.className = 'flex'

	const intentionText = document.createElement('p')
	intentionText.textContent = value
	intentionWrapper.appendChild(intentionText)

	const intentionEdit = document.createElement('button')
	intentionEdit.appendChild(document.createTextNode('Edit'))
	intentionEdit.onclick = () => showInput(parent, intentionWrapper, value)
	intentionWrapper.appendChild(intentionEdit)

	parent.appendChild(intentionWrapper)
}

function showInput(parent, toDelete, value = '') {
	parent.parentNode.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'

	const inputWrapper = document.createElement('div')
	inputWrapper.className = 'flex'

	const inputField = document.createElement('input')
	inputField.type = 'text'
	inputField.id = 'intent-input'
	inputField.value = value
	inputWrapper.appendChild(inputField)

	const inputButton = document.createElement('button')
	inputButton.appendChild(document.createTextNode('Submit'))
	inputButton.onclick = () =>
		setIntention(parent, inputWrapper, inputField.value)
	inputWrapper.appendChild(inputButton)

	if (toDelete) {
		parent.removeChild(toDelete)
	}

	parent.appendChild(inputWrapper)
}

function setIntention(parent, toDelete, value) {
	sessionStorage.setItem('intention', value)

	if (toDelete) {
		parent.removeChild(toDelete)
	}

	showIntention(parent, value)
}

init()
