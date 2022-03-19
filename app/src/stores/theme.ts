import api from '@/api';
import { unexpectedError } from '@/utils/unexpected-error';
import { defineStore } from 'pinia';
import { Theme } from '@directus/shared/types';
import { baseLight, baseDark } from '@/themes';
import { parseTheme } from '@/utils/theming';

/** Matches structure in database */
interface ThemeVariants {
	dark: Theme;
	light: Theme;
}

export const useThemeStore = defineStore({
	id: 'themesStore',
	state: () => ({
		themes: null as null | ThemeVariants,
	}),
	getters: {
		/**
		 * Getter returns function -
		 * Usage: themeCSS( 'dark' | 'light' )
		 */
		themeCSS: (state) => {
			return (mode: 'dark' | 'light'): string => {
				let themeVariables = '';
				if (state.themes && state.themes[mode].theme) {
					themeVariables = parseTheme(state.themes[mode].theme);
				}

				/**
				 * You'll notice we add a couple tabs to the line breaks in the
				 * themeVariables string. This is purely cosmetic. The indentation
				 * a little weird in the page source if we don't do this.
				 */
				const resolvedThemeCSS = `\n\n\
body.${mode} {
	${themeVariables.replace(/\n/g, '\n\t')}
}

@media (prefers-color-scheme: ${mode}) {
	body.auto {
		${themeVariables.replace(/\n/g, '\n\t\t')}
	}
}`;

				return resolvedThemeCSS;
			};
		},
	},
	actions: {
		async hydrate() {
			/** Pull in base themes first */
			this.themes = {
				dark: baseDark || {},
				light: baseLight || {},
			};

			/** TODO: Merge with theme overrides from database */
		},

		async dehydrate() {
			this.$reset();
		},

		async updateTheme(updates: { [key: string]: any }) {
			/** Just leaving this here temporarily */
		},
	},
});
