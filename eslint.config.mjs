import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tslintPlugin from 'typescript-eslint'

const rules = {
	...eslintPluginPrettier.rules,
	'react/prop-types': 'off',
	'react/react-in-jsx-scope': 'off',
	'react/display-name': 'off',
	'@typescript-eslint/ban-ts-comment': 'off',
	'padding-line-between-statements': [
		'warn',
		{
			blankLine: 'always',
			prev: '*',
			next: ['continue', 'break', 'return', 'class', 'for', 'function', 'if', 'throw', 'while'],
		},
		{
			blankLine: 'always',
			prev: ['directive', 'if'],
			next: '*',
		},
		{
			blankLine: 'always',
			prev: ['const', 'let', 'var'],
			next: '*',
		},
		{
			blankLine: 'any',
			prev: ['const', 'let', 'var'],
			next: ['const', 'let', 'var'],
		},
	],
}
const plugins = {
	tslint: tslintPlugin.plugin,
	...eslintPluginPrettier.plugins,
}
const languageOptions = {
	parser: tslintPlugin.parser,
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2025,
		globals: { ...globals.browser, ...globals.es2025 },
	},
}

export default defineConfig([
	{
		files: ['**/*.js', '**/*.ts'],
		plugins,
		languageOptions,
		rules,
	},
])
