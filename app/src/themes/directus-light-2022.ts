import { Theme } from '@directus/shared/types';

export const lightTheme: Theme = {
	name: 'Directus Light 2022',
	author: 'Directus',
	description: 'Primary light Directus theme',
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
					normal: '#6644FF',
					accent: '#553BC8',
					subtle: '#F3EAFF',
				},
				secondary: {
					normal: '#FF99DD',
					accent: '#DA84BF',
					subtle: '#FFEEF9',
				},
				success: {
					normal: '#2ECDA7',
					accent: '#2EB090',
					subtle: '#E4F8EF',
				},
				warning: {
					normal: '#FBC54F',
					accent: '#D8AA49',
					subtle: '#FFF2DD',
				},
				danger: {
					normal: '#E35169',
					accent: '#BB4859',
					subtle: '#FFECEC',
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
					invert: '#0D1117',
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
				background: {
					normal: '#18222F',
					hover: '#18222F',
					active: '#F0F4F9',
				},
				foreground: {
					normal: '#8196B1',
					hover: '#FFFFFF',
					active: '#172940',
				},
			},
		},
	},
};
