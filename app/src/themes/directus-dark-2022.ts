import { Theme } from '@directus/shared/types';

export const darkTheme: Theme = {
	name: 'Directus Dark 2022',
	author: 'Directus',
	description: 'Primary dark Directus theme',
	theme: {
		global: {
			font: {
				family: {
					sans: [
						'Inter',
						'-apple-system',
						'BlinkMacSystemFont',
						'Segoe UI',
						'Roboto',
						'Helvetica',
						'Arial',
						'sans-serif',
						'Apple Color Emoji',
						'Segoe UI Emoji',
						'Segoe UI Symbol',
					],
					serif: ['Merriweather', 'serif'],
					mono: ['Fira Mono', 'monospace', 'sans-serif'],
				},
			},
			border: {
				width: 2,
				radius: 6,
			},
			color: {
				primary: {
					normal: '#8866ff',
					accent: '#A583FF',
					subtle: '#201e3c',
				},
				secondary: {
					normal: '#FF99DD',
					accent: '#FFC7EC',
					subtle: '#261f2c',
				},
				success: {
					normal: '#2ECDA7',
					accent: '#96E3C8',
					subtle: '#102526',
				},
				warning: {
					normal: '#FBC54F',
					accent: '#FFE9C4',
					subtle: '#26241d',
				},
				danger: {
					normal: '#E35169',
					accent: '#ED7783',
					subtle: '#2f1b24',
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
