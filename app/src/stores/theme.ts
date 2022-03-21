import api from '@/api';
import { unexpectedError } from '@/utils/unexpected-error';
import { defineStore } from 'pinia';
import { Theme } from '@directus/shared/types';
import { baseLight, baseDark } from '@/themes';
import { parseTheme } from '@/utils/theming';

type ThemeVariants = 'dark' | 'light';
type ThemeVersions = 'base' | 'overrides';

export const useThemeStore = defineStore({
	id: 'themesStore',
	state: () => ({
		baseThemes: {} as Record<ThemeVariants, Theme>,
		/** For now, the theme overrides don't need to define the entire theme. Only the alterations. */
		themeOverrides: {} as Record<ThemeVariants, Theme['theme']>,
	}),
	getters: {
		/**
		 * Getter returns function -
		 * Usage: getThemeCSS( 'dark' | 'light', 'base' | 'overrides' )
		 */
		getThemeCSS: (state) => {
			return (mode: ThemeVariants = 'light', version: ThemeVersions = 'base'): string => {
				let themeVariables = '';

				if (version === 'overrides') {
					if (state.themeOverrides[mode]) {
						themeVariables = parseTheme(state.themeOverrides[mode]);
					}
				} else {
					if (state.baseThemes[mode]?.theme) {
						themeVariables = parseTheme(state.baseThemes[mode].theme);
					}
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
			this.baseThemes.dark = baseDark || {};
			this.baseThemes.light = baseLight || {};

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
