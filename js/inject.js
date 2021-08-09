/**
 * @file Content script that will get injected into matching websites.
 */

// const url = new URL(window.location.href)
// const placeholder = 'Your intention to browse ' + url.hostname
const extensionID = chrome.runtime.id
const template = document.createElement('template')

template.innerHTML = /*html*/ `
	<style>
		/* Blurs the page */
		#veil {
			display: block;
			width: 100%;
			height: 100%;
			position: fixed;
			left: 0;
			top: 0;
			background-color: rgba(0, 0, 0, 0.4);
			z-index: 99999;
			backdrop-filter: blur(10px);
			visibility: hidden;
			opacity: 0;
		}

		#veil.isVisible {
			visibility: visible;
			opacity: 1;
		}

		/* 
		 * Intention box
		 */
		.container {
			--font-size: 16px;
			--spacing: 16px;


			position: fixed;
			display: inline-block;
			z-index: 9999999;
			top: 0;
			left: 50%;
			
			display: flex;
			justify-content: center;
			background: rgba(255,255,255,0.8);
			backdrop-filter: blur(12px);
			color: #000;
			font-size: var(--font-size);
			transform: translateX(-50%);
			padding: var(--spacing);
			border-radius: 12px;

			box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
		}

		.container:hover #input::after {
			opacity: 1;
		}


		/* 
		 * Intention input
		 */
		#input {
			position: relative;
			padding: 6px;	
		}

		#input:focus {
			border: none;
			border-bottom: 1px solid #eee;
			outline: none;
		}

		#input:empty::before{
 			 content:attr(data-placeholder);
  				color:grey;
  				font-style:italic;
		}

		#input:not(:focus):hover {
			background: rgba(0,0,0,0.025);
		}

		/*#input::after {
			left: 100%;
			top: 0;
			content: "Edit";		
			position: absolute;
			height: 100%;
			display: flex;
			align-items: center;
			padding: 0px var(--spacing);	
			color: lightgray;
			opacity: 0;
		}*/

		#input:focus::after {
			content: "↵ Enter";
			pointer-events: none;
			opacity: 1;
			left: 100%;
			top: 0;		
			white-space: nowrap;
			position: absolute;
			height: 100%;
			display: flex;
			align-items: center;
			padding: 0px 32px;	
			color: lightgray;

		}

		#input:empty:after {
			pointer-events: all;
		}

		/* 
		 * On drag
		 */
		.container.is-dragging {
			cursor:-webkit-grabbing;
		}

		.container.is-dragging #input:hover {
			background: none;
		}

		/* 
		 * On edit
		 */
		.container.is-editing {
			background: rgba(255,255,255,1);
		}
	</style>
	<div id="veil"></div>
	<div class="container" id="container">
			<div id="input" data-placeholder="What is your intention?"></div>
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
