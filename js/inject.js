/**
 * @file Content script that will get injected into matching websites.
 */

let template = document.createElement('template')
template.innerHTML = `
	<style>
		#backdrop {
			width: 100%;
			height: 100%;
			z-index: 999;
			position: fixed;
			top: 0;
			left: 0;
			opacity: 1;
			background: rgba(0,0,0,0.2);
			backdrop-filter: blur(10px);
			transition: opacity .2s;

		}

		#container {
			position: fixed;
			z-index: 9999;
			left: 50%;
			top: 24px;
			background: #fff;
			border-radius: 16px;
			color: #000;
			padding: 32px;
			transform: translateX(-50%);
			box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
			caret-color: red;
		}

		#intention {
			display: flex;
		}


		.isEditing #input {
			display: block;
		}

		.isEditing label {
			display: none;
		}


		  #input {
			display: none;
			  width: 400px;
		  }

		  #input {
			border: none;
			outline: none
		  }

		  #input:focus, #input:active {
			  border: none;
			  outline: none
		  }
	</style>
	<div id="backdrop"></div>
	<div id="container">
		<form id="intention">
			<label id="label"></label>
			<input id="input" autocomplete="off"  />
			<button id="button" disabled="true">Edit</button>		
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
		// than using innerHTML becffause it avoids addtional HTML parse costs'.
		shadowRoot.appendChild(template.content.cloneNode(true))

		const backdrop = this.shadowRoot.getElementById('backdrop')
		const container = this.shadowRoot.getElementById('container')
		const input = this.shadowRoot.getElementById('input')
		const label = this.shadowRoot.getElementById('label')
		const button = this.shadowRoot.getElementById('button')
		const intention = this.shadowRoot.getElementById('intention')

		const url = new URL(window.location.href)

		input.placeholder = 'Your intention to browse ' + url.hostname

		if (!sessionStorage.getItem('intention')) {
			document.body.classList.add('intent-focus')
			container.classList.add('isEditing')
			backdrop.style.opacity = 1
		} else {
			label.textContent = sessionStorage.getItem('intention')
			backdrop.style.opacity = 0
		}

		intention.addEventListener('submit', this.editIntention)
		input.addEventListener('input', function (e) {
			button.disabled = !e.target.value.length
		})
	}

	connectedCallback() {
		// When creating closed shadow trees, you'll need to stash the shadow root
		// for later if you want to use it again. Kinda pointless.
		const input = this.shadowRoot.getElementById('input')
		input.focus()
	}

	/**
	 * Edit intention and set session storage.
	 * @param {Event}
	 */
	editIntention(e) {
		e.preventDefault()
		const item = this.parentNode
		const parent = item.parentNode

		const backdrop = parent.getElementById('backdrop')
		const input = parent.getElementById('input')
		const label = parent.getElementById('label')

		const isEditing = item.classList.contains('isEditing')

		if (isEditing) {
			sessionStorage.setItem('intention', input.value)
			label.textContent = input.value
			backdrop.style.opacity = 0
		} else {
			input.value = label.textContent
			backdrop.style.opacity = 1
		}
		item.classList.toggle('isEditing')
		document.body.classList.toggle('intent-focus')
	}
}

customElements.define('intention-container', Intention)
const container = document.createElement('intention-container')
document.body.appendChild(container)
