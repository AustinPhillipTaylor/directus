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
					normal: '#8866ff',
					accent: '#D5C9FF',
					subtle: '#2C2651',
				},
				secondary: {
					normal: '#FF99DD',
					accent: '#FFDBF3',
					subtle: '#4A3349',
				},
				success: {
					normal: '#2ECDA7',
					accent: '#B6EEE0',
					subtle: '#15403B',
				},
				warning: {
					normal: '#FBC54F',
					accent: '#FEEBC1',
					subtle: '#493E25',
				},
				danger: {
					normal: '#E35169',
					accent: '#F5C2CB',
					subtle: '#43212C',
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
					subtle: '#666672',
					invert: '#0D1117',
				},
			},
		},
		/**
		 * Future iterations can build this out further to include more nuanced
		 * categories, such as inputs, buttons, tables, etc.
		 */
		components: {
			module: {
				background: {
					normal: '#0D1117',
					hover: '#0D1117',
					active: '#21262E',
				},
				foreground: {
					normal: '#666672',
					hover: '#FFFFFF',
					active: '#F0F6FC',
				},
			},
		},
	},
};
