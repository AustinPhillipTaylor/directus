import { Theme } from '@directus/shared/types';

export const darkTheme: Theme = {
	name: 'Directus Dark 2022',
	author: 'Directus',
	description: 'Primary dark Directus theme',
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
					accent: '#DDDDFF',
					subtle: '#4422DD',
				},
				secondary: {
					normal: '#FF99DD',
					accent: '#FFDDEE',
					subtle: '#FF77BB',
				},
				warning: {
					normal: '#FBC54F',
					accent: '#FEF0D3',
					subtle: '#EDBA4A',
				},
				danger: {
					normal: '#E35169',
					accent: '#F8D3D9',
					subtle: '#CE3D55',
				},
				border: {
					normal: '#30363D',
					accent: '#484f58',
					subtle: '#21262D',
				},
				background: {
					normal: '#21262E',
					accent: '#30363D',
					subtle: '#161B22',
					page: '#0D1117',
					invert: '#FFFFFF',
				},
				foreground: {
					normal: '#C9D1D9',
					accent: '#F0F6FC',
					subtle: '#8B949E',
					invert: '#0D1117',
				},
			},
		},
		/**
		 * Future iterations can build this out further to include more nuanced
		 * categories, such as inputs, buttons, tables, etc.
		 */
		category: {
			module: {
				background: '#0D1117',
				foreground: '#8B949E',
				hover: {
					background: '#0D1117',
					foreground: '#FFFFFF',
				},
				active: {
					background: '#21262E',
					foreground: '#FF99DD',
				},
			},
		},
	},
};
