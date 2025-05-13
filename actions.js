export function GetActions(instance) {
	const actions = {}

	// Create choices for the dropdown
	const variableChoices = []
	for (let i = 1; i <= 10; i++) {
		variableChoices.push({ id: `text_${i}`, label: `Text Variable ${i}` })
	}

	actions['set_text_variable'] = {
		name: 'Set Text Variable Value',
		options: [
			{
				type: 'dropdown',
				label: 'Target Variable',
				id: 'variable',
				default: 'text_1',
				choices: variableChoices,
			},
			{
				type: 'textinput',
				label: 'Value',
				id: 'value',
				default: '',
				useVariables: true, // Allow Companion variables in this field
			},
		],
		callback: async (action, context) => {
			const options = action.options
			const targetVar = options.variable
			const value = await context.parseVariablesInString(options.value)

			instance.log('info', `Action: Setting text for ${targetVar} to "${value}"`)
			instance.updateVariableText(targetVar, value)
		},
	}

	actions['set_text_variable_color'] = {
		name: 'Set Text Variable Color',
		options: [
			{
				type: 'dropdown',
				label: 'Target Variable',
				id: 'variable',
				default: 'text_1',
				choices: variableChoices,
			},
			{
				type: 'colorpicker',
				label: 'Text Color',
				id: 'color',
				default: 16777215, // Default to white (decimal for #FFFFFF)
			},
		],
		callback: async (action) => {
			const options = action.options
			const targetVar = options.variable
			const colorValue = options.color // This is a decimal number

			// Convert decimal color to hex string #RRGGBB
			const hexColor = `#${(colorValue & 0xffffff).toString(16).padStart(6, '0')}`

			instance.log('info', `Action: Setting color for ${targetVar} to "${hexColor}"`)
			instance.updateVariableColor(targetVar, hexColor)
		},
	}

	return actions
}
