/**
 * @file Content script that will get injected into matching websites.
 */

let template = document.createElement('template')
template.innerHTML = `
	<style>
		#container {
			position: fixed;
			z-index: 9999;
			right: 24px;
			top: 24px;
			background: #000;
			color: #fff;
			padding: 32px;
		}

		input[type='text'] {
			display: none;
		}

		.isEditing input[type='text'] {
			display: block;
		}

		.isEditing label {
			display: none;
		}
	</style>

	<div id="container">
		<form id="intention">
			<label id="label"><!-- ... --></label>
			<input id="input_field" type="text" placeholder="Your intention"/>
			<button id="edit_button">Edit</button>
		</form>
	</div>
`

/**
 * Custom element that encapsulates the injected container and
 * avoids conflicts with incoming or outgoing styles etc.
 */
class Intention extends HTMLElement {
	constructor() {
		super()

		let shadowRoot = this.attachShadow({ mode: 'open' })
		// TIL: 'Cloning contents from a <template> element is more performant
		// than using innerHTML because it avoids addtional HTML parse costs'.
		shadowRoot.appendChild(template.content.cloneNode(true))

		const container = this.shadowRoot.getElementById('container')
		const label = this.shadowRoot.getElementById('label')
		const intention = this.shadowRoot.getElementById('intention')

		if (!sessionStorage.getItem('intention')) {
			document.body.classList.add('intent-focus')
			container.classList.add('isEditing')
		} else {
			label.textContent = sessionStorage.getItem('intention')
		}

		intention.addEventListener('submit', this.editIntention)
	}

	/**
	 * Edit intention and set session storage.
	 * @param {Event}
	 */
	editIntention(e) {
		e.preventDefault()
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
}

customElements.define('intention-container', Intention)
const container = document.createElement('intention-container')
document.body.appendChild(container)
