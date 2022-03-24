import api from '@/api';
import { unexpectedError } from '@/utils/unexpected-error';
import { defineStore } from 'pinia';
import { notify } from '@/utils/notify';
import { i18n } from '@/lang';
import { Theme } from '@directus/shared/types';
import { baseLight, baseDark } from '@/themes';
import { parseTheme } from '@/utils/theming';

type ThemeVariants = 'dark' | 'light';
type ThemeVersions = 'base' | 'overrides';
type ThemeBase = Record<ThemeVariants, Theme>;
type ThemeOverrides = Record<ThemeVariants, Theme['theme']>;

export const useThemeStore = defineStore({
	id: 'themesStore',
	state: () => ({
		themeBase: {} as ThemeBase,
		/** For now, the theme overrides don't need to define the entire theme. Only the alterations. */
		themeOverrides: {} as ThemeOverrides,
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
					if (state.themeBase[mode]?.theme) {
						themeVariables = parseTheme(state.themeBase[mode].theme);
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
			this.themeBase.dark = baseDark || {};
			this.themeBase.light = baseLight || {};

			/** Get server info to pull overrides */
			const serverInfo = await api.get(`/server/info`, { params: { limit: -1 } });
			const overrides: ThemeOverrides = serverInfo.data.data.project['theme_overrides'];

			this.themeOverrides.dark = overrides.dark || {};
			this.themeOverrides.light = overrides.light || {};
		},

		async dehydrate() {
			this.$reset();
		},

		async updateThemeOverrides(updates: ThemeOverrides) {
			try {
				const response = await api.patch(`/settings/themes`, updates);
				this.themeOverrides = response.data.data.theme_overrides;
				notify({
					title: i18n.global.t('theme_update_success'),
				});
			} catch (err: any) {
				unexpectedError(err);
			}
		},
	},
});
