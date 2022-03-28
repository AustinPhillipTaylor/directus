import { Theme } from '@directus/shared/types';

export const lightTheme: Theme = {
	name: 'Directus Light 2022',
	author: 'Directus',
	description: 'Primary light Directus theme',
	theme: {
		global: {
			font: {
				size: '16px',
				family: {
					sans: '"Inter", -apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
					serif: '"Merriweather", serif',
					mono: '"Fira Mono", monospace, sans-serif',
				},
			},
			border: {
				width: '2px',
				radius: '6px',
			},
			color: {
				primary: {
					normal: '#6644FF',
					accent: '#4422DD',
					subtle: '#DDDDFF',
				},
				secondary: {
					normal: '#FF99DD',
					accent: '#FF77BB',
					subtle: '#FFDDEE',
				},
				warning: {
					normal: '#FBC54F',
					accent: '#EDBA4A',
					subtle: '#FEF0D3',
				},
				danger: {
					normal: '#E35169',
					accent: '#CE3D55',
					subtle: '#F8D3D9',
				},
				border: {
					normal: '#D3DAE4',
					accent: '#A2B5CD',
					subtle: '#F0F4F9',
				},
				background: {
					normal: '#F0F4F9',
					accent: '#E4EAF1',
					subtle: '#F7FAFC',
					page: '#FFFFFF',
					invert: '#263238',
				},
				foreground: {
					normal: '#4F5464',
					accent: '#172940',
					subtle: '#A2B5CD',
					invert: '#FFFFFF',
				},
			},
		},
		/**
		 * Future iterations can build this out further to include more nuanced
		 * categories, such as inputs, buttons, tables, etc.
		 */
		components: {
			module: {
				background: '#18222F',
				foreground: '#8196B1',
				hover: {
					background: '#18222F',
					foreground: '#FFFFFF',
				},
				active: {
					background: '#F0F4F9',
					foreground: '#172940',
				},
			},
		},
	},
};
