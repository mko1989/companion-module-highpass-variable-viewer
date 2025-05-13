import { Regex } from '@companion-module/base'

export function GetConfigFields() {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module connects to the Variable Viewer web application to send variable values.',
		},
		{
			type: 'textinput',
			id: 'targetIp',
			label: 'Target IP Address',
			width: 6,
			tooltip: 'The IP address of the server running the Variable Viewer web app',
			regex: Regex.IP, // Use Companion's built-in IP regex validator
			default: '127.0.0.1',
		},
		{
			type: 'textinput',
			id: 'targetPort',
			label: 'Target Port',
			width: 6,
			tooltip: 'The port the Variable Viewer web app is listening on (default: 3333)',
			regex: Regex.PORT,
			default: '3333',
		},
	]
} 