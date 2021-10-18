/**
 * @file Content script that gets injected in matching websites
 * and displays the intention field.
 */

const placeholder = "What's your intention?"
const extensionID = chrome.runtime.id
const template = document.createElement('template')

template.innerHTML = /*html*/ `
	<style>
		/* Blurs the page */
		#veil {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 99999;
			display: block;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.4);
			visibility: hidden;
			opacity: 0;
			backdrop-filter: blur(16px);
		}

		#veil.isVisible {
			visibility: visible;
			opacity: 1;
		}

		/* 
		* Intention box
		*/
		.container {
			/* We don't have access to vars.css */
			--font-size: 16px;
			--spacing: 16px;
			--color-accent: rgba(0, 122, 255, 1);
			--color-highlight: #3a3b3c;

			position: fixed;
			top: 32px;
			left: 50%;
			z-index: 9999999;
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 128px;
			padding: 8px 16px 8px 42px;
			color: #000;
			font-size: var(--font-size);
			background: #fff;
			border-radius: 96px;
			box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
			transform: translateX(-50%);
			cursor: grab;
		}

		.icon::before,
		.icon::after {
			position: absolute;
			top: 50%;
			left: 18px;
			width: 16px;
			height: 16px;
			background: #000;
			background: linear-gradient(
				190deg,
				rgba(192, 192, 192, 0.6) 0%,
				rgba(155, 155, 155, 0) 100%
			);
			border-radius: 100%;
			transform: translate3D(0px, -50%, 0);
			transition: transform 0.4s;
			content: '';
			opacity: 0.8 !important;
		}

		#input:empty + .icon::before {
			transform: translate3D(-4px, -50%, 0) !important;
			opacity: 1 !important;
		}

		#input:empty + .icon::after {
			transform: translate3D(4px, -50%, 0) !important;
			opacity: 1 !important;
		}

		/* 
		* Intention input
		*/
		#input {
			position: relative;
			min-width: 128px;
			padding: 6px;
			border-radius: 96px;
			cursor: text !important;
		}

		#input:focus {
			border: none;
			outline: none;
		}

		#input:empty::before {
			color: #717171;
			font-style: italic;
			content: "${placeholder}";
		}

		#input:not(:focus):hover {
			background: rgba(0, 0, 0, 0.025);
		}

		#input:focus::after {
			position: absolute;
			top: 0;
			left: 100%;
			display: flex;
			align-items: center;
			height: 100%;
			padding: 0px 32px;
			color: lightgray;
			white-space: nowrap;
			opacity: 1;
			content: '↵ Enter';
			pointer-events: none;
			transition: opacity .3s;
		}

		#input:empty::after {
			opacity: 0 !important;
		}

		#input:empty::after {
			pointer-events: all;
		}

		.container:hover #input::after {
			opacity: 1;
		}

		/* 
		* On drag
		*/
		.container.is-about-to-drag {
			cursor: grabbing !important;
		}

		.container.is-dragging #input {
			cursor: grabbing !important;
		}

		.container.is-dragging #input:hover {
			background: none;
		}
	</style>
	<div id="veil"></div>
	<div class="container" id="container">
			<div id="input"></div><span class="icon"></span>
	</div>
`

/**
 * Custom element that encapsulates the injected container and
 * avoids conflicts with incoming or outgoing styles etc.
 */
class Intention extends HTMLElement {
	constructor() {
		super()

		let rec, initX, initY, isDragging
		let draggable = true
		let vector = { x: -1, y: -1 }

		const drag_treshold = 6 // px
		const shadowRoot = this.attachShadow({ mode: 'open' })
		shadowRoot.appendChild(template.content.cloneNode(true))

		this.veil = this.shadowRoot.getElementById('veil')
		this.input = this.shadowRoot.getElementById('input')
		this.container = this.shadowRoot.getElementById('container')

		/**
		 * Handle input events
		 */
		this.input.addEventListener('focus', (e) => {
			document.body.classList.add('intent-focus')
			this.veil.classList.add('isVisible')
			this.container.classList.add('is-editing')
			draggable = false
		})

		this.input.addEventListener('blur', (e) => {
			// trap focus if no intention has been set
			if (!this.input.innerHTML) {
				this.input.focus()
			} else {
				sessionStorage.setItem(
					`${extensionID}-intention`,
					e.target.innerHTML
				)
				this.veil.classList.remove('isVisible')
				this.container.classList.remove('is-editing')
				document.body.classList.remove('intent-focus')
				this.input.contentEditable = 'false'
				draggable = true
			}
		})

		this.input.addEventListener('keydown', (e) => {
			// some websites (ex. youtube) prevent whitespaces hence we insert them programmatically, TODO: figure out why
			if (e.key === ' ' || e.key === 'Spacebar') {
				e.preventDefault()
				this.insertAtCursor('&nbsp;')
			} else if (e.key === 'Enter') {
				e.preventDefault()
				this.input.blur()
			}
		})

		/**
		 * Handle drag events
		 */
		this.container.addEventListener('mousedown', (e) => {
			rec = this.container.getBoundingClientRect()
			initX = e.clientX
			initY = e.clientY
			isDragging = true
			this.container.classList.add('is-about-to-drag')
		})

		document.addEventListener('mousemove', (e) => {
			if (draggable && isDragging) {
				e.preventDefault()

				const deltaX = Math.abs(e.clientX - initX)
				const deltaY = Math.abs(e.clientY - initY)
				if (deltaX < drag_treshold && deltaY < drag_treshold) {
					this.container.classList.add('is-dragging')
				}

				const absoluteX = Math.min(
					Math.max(rec.left + e.clientX - initX, 0),
					window.innerWidth - rec.width
				)
				const absoluteY = Math.min(
					Math.max(rec.top + e.clientY - initY, 0),
					window.innerHeight - rec.height
				)
				const relativeX = (100 * absoluteX) / window.innerWidth //-> %
				const relativeY = (100 * absoluteY) / window.innerHeight //-> %
				vector = { x: relativeX, y: relativeY }

				this.container.style.transform = 'none'
				this.container.style.left = `${vector.x}%`
				this.container.style.top = `${vector.y}%`
			}
		})

		document.addEventListener('mouseup', (e) => {
			const deltaX = Math.abs(e.clientX - initX)
			const deltaY = Math.abs(e.clientY - initY)

			if (deltaX < drag_treshold && deltaY < drag_treshold) {
				this.input.contentEditable = true
				this.input.focus()
			} else {
				sessionStorage.setItem(
					`${extensionID}-position`,
					JSON.stringify(vector)
				)
			}

			isDragging = false
			this.container.classList.remove('is-about-to-drag')
			this.container.classList.remove('is-dragging')
		})
	}

	connectedCallback() {
		if (sessionStorage.getItem(`${extensionID}-position`)) {
			const storage = sessionStorage.getItem(`${extensionID}-position`)
			const pos = JSON.parse(storage)
			if (pos.x > -1 && pos.y > -1) {
				this.container.style.transform = 'none'
				this.container.style.left = `${pos.x}%`
				this.container.style.top = `${pos.y}%`
			}
		}

		if (!sessionStorage.getItem(`${extensionID}-intention`)) {
			this.input.contentEditable = true
			this.input.focus()
		} else {
			this.input.innerHTML = sessionStorage.getItem(
				`${extensionID}-intention`
			)
		}
	}

	insertAtCursor(character) {
		const root = this.shadowRoot
		if (root.getSelection && root.getSelection().getRangeAt) {
			const range = root.getSelection().getRangeAt(0)
			const node = range.createContextualFragment(character)
			range.deleteContents()
			range.insertNode(node)
			root.getSelection().collapseToEnd()
			root.getSelection().modify('move', 'forward', 'character')
		}
	}
}

customElements.define('intention-container', Intention)
const container = document.createElement('intention-container')
document.body.prepend(container)
