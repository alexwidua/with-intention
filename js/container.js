/**
 * @file Content script that will get injected into matching websites.
 */

/**
 * Change current intention.
 */
const editItem = function () {
	const item = this.parentNode

	const input = item.querySelector('input[type=text]')
	const label = item.querySelector('label')

	const isEditing = item.classList.contains('isEditing')

	if (isEditing) {
		sessionStorage.setItem('intention', input.value)
		label.textContent = input.value
	} else {
		input.value = label.textContent
	}
	item.classList.toggle('isEditing')
	document.body.classList.toggle('intent-focus')
}

const template = document.createElement('p')

template.innerHTML = 'lol'

class PopUpInfo extends HTMLElement {
	constructor() {
		// Always call super first in constructor
		super()

		// Create a shadow root
		this.attachShadow({ mode: 'open' })

		customElements.define('popup-info', PopUpInfo)
	}

	connectedCallback() {
		console.log('lol')
		this.innerHTML = `<h1>Hello, World!</h1>`
		// const test = document.createElement('p')

		// test.textContent = 'lol'

		// this.appendChild(test)
	}
}

/**
 * Create DOM tree
 */

// const wrapper = document.createElement('div')

// // Use Shadow DOM to avoid style overrides and conflicts
// const shadowRoot = wrapper.attachShadow({ mode: 'open' })
// shadowRoot.innerHTML = `
//   <style>
//   #intent-container {
// 	position: fixed;
// 	z-index: 9999;
// 	right: 24px;
// 	top: 24px;
// 	background: red;
// 	padding: 32px;
// }

//   input[type='text'] {
// 	display: none;
// }

// .isEditing input[type='text'] {
// 	display: block;
// }

// .isEditing {
// 	color: red !important;
// }

// .isEditing label {
// 	display: none;
// }
//   </style>
// `

// const label = document.createElement('label')

// const input = document.createElement('input')
// input.type = 'text'
// input.placeholder = 'Input intention here'

// const editButton = document.createElement('button')
// editButton.appendChild(document.createTextNode('Edit'))
// editButton.onclick = editItem

// if (!sessionStorage.getItem('intention')) {
// 	// Show intention
// 	document.body.classList.add('intent-focus')
// 	container.classList.add('isEditing')
// } else {
// 	// Set intention
// 	label.textContent = sessionStorage.getItem('intention')
// }

// // Append everything
// const x = document.createElement('div')

// x.appendChild(label)
// x.appendChild(input)
// x.appendChild(editButton)
// x.id = 'intent-container'
// shadowRoot.appendChild(x)

const test = document.createElement('yolo')

customElements.define('one-dialog', PopUpInfo)

// document.body.appendChild(container)
