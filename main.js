import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import { GetConfigFields } from './config.js'
import { GetActions } from './actions.js' // Import actions
import { io } from 'socket.io-client' // Import socket.io-client

class VariableViewerInstance extends InstanceBase {
	socket = null // Websocket client instance
	variableStates = {} // Changed from textVariables to store {text, color}

	async init(config) {
		this.config = config
		this.log('info', 'Initializing Variable Viewer Module')

		this.updateStatus(InstanceStatus.Connecting, 'Initializing')

		this.initVariables()
		this.init_websocket()

		this.setActionDefinitions(GetActions(this)) // Initialize actions
		// The following subscribeVariables call is not needed for the module's own variables
		// and was causing an error. checkVariables will be called automatically.
		// const variableIdsToSubscribe = Object.keys(this.variableStates)
		// if (variableIdsToSubscribe.length > 0) {
		// 	this.subscribeVariables(...variableIdsToSubscribe)
		// }
	}

	async destroy() {
		this.log('info', 'Destroying Variable Viewer Module')
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}
		this.updateStatus(InstanceStatus.Disconnected, 'Destroyed')
	}

	async configUpdated(config) {
		this.log('info', 'Configuration updated')
		this.config = config
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}
		this.init_websocket()
	}

	getConfigFields() {
		return GetConfigFields()
	}

	initVariables() {
		const variables = []
		const defaultColor = '#FFFFFF' // Default text color (white)
		for (let i = 1; i <= 10; i++) {
			const varName = `text_${i}`
			variables.push({ variableId: varName, name: `Text Variable ${i}` })
			// Initialize internal storage with text and color
			this.variableStates[varName] = { text: '', color: defaultColor }
		}
		this.setVariableDefinitions(variables)
		this.updateCompanionVariableValues() // Set initial values in Companion
	}

	// Renamed from updateVariableValues to be more specific
	updateCompanionVariableValues() {
		const values = {}
		for (const varName in this.variableStates) {
			values[varName] = this.variableStates[varName].text // Companion only stores the text
		}
		this.setVariableValues(values)
		// We don't necessarily send to app here, actions will trigger that
	}

	// New method to specifically update a single variable's text and sync
	updateVariableText(variableName, text) {
		if (this.variableStates[variableName]) {
			this.variableStates[variableName].text = text
			this.updateCompanionVariableValues() // Update Companion's string variable
			this.sendVariablesToApp()       // Send updated state to the app
		}
	}

	// New method to specifically update a single variable's color and sync
	updateVariableColor(variableName, color) {
		if (this.variableStates[variableName]) {
			this.variableStates[variableName].color = color
			// No need to updateCompanionVariableValues as color is not stored in Companion variables
			this.sendVariablesToApp() // Send updated state to the app
		}
	}

	init_websocket() {
		if (!this.config.targetIp || !this.config.targetPort) {
			this.updateStatus(InstanceStatus.BadConfig, 'Missing IP or Port')
			this.log('warn', 'WebSocket connection not attempted due to missing IP or Port in config.')
			return
		}

		const serverUrl = `ws://${this.config.targetIp}:${this.config.targetPort}`
		this.log('info', `Attempting to connect to WebSocket server at ${serverUrl}`)

		// Clean up existing socket if any before creating a new one
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}

		this.socket = io(serverUrl, {
			reconnectionAttempts: 5,
			reconnectionDelay: 3000,
			transports: ['websocket'], // Force websocket transport
		})

		this.socket.on('connect', () => {
			this.log('info', 'Connected to Variable Viewer server')
			this.updateStatus(InstanceStatus.Ok)
			this.sendVariablesToApp() // Send current state on connect
		})

		this.socket.on('disconnect', (reason) => {
			this.log('warn', `Disconnected from Variable Viewer server: ${reason}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Disconnected')
		})

		this.socket.on('connect_error', (err) => {
			this.log('error', `WebSocket connection error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})
	}

	// checkVariables is called by Companion when a subscribed variable's value changes
	// This typically happens if another module writes to this module's variable,
	// or if a user uses "Set Variable" in Companion GUI directly on this module's variable.
	checkVariables(changedVariables) {
		this.log('debug', `checkVariables triggered: ${JSON.stringify(changedVariables)}`)
		let shouldUpdateApp = false
		for (const varId in changedVariables) {
			// Check if the changed variable is one of ours (e.g., 'text_1')
			if (this.variableStates.hasOwnProperty(varId)) {
				const newTextValue = changedVariables[varId]
				if (this.variableStates[varId].text !== newTextValue) {
					this.variableStates[varId].text = newTextValue
					shouldUpdateApp = true
				}
			}
		}

		if (shouldUpdateApp) {
			this.log('debug', 'Change detected in checkVariables, sending updates to app.')
			this.sendVariablesToApp()
			// No need to call setVariableValues here, as Companion already has the new value
			// that triggered this callback.
		}
	}

	sendVariablesToApp() {
		if (this.socket && this.socket.connected) {
			// Send the entire variableStates object which includes text and color
			this.log('debug', `Sending variableStates to app: ${JSON.stringify(this.variableStates)}`)
			this.socket.emit('companionVariables', this.variableStates)
		} else {
			this.log('warn', 'Cannot send variables: WebSocket not connected.')
		}
	}
}

runEntrypoint(VariableViewerInstance, []) 