/* eslint-disable no-console */

import api from '@/api';
import { unexpectedError } from '@/utils/unexpected-error';
import { defineStore } from 'pinia';
import { notify } from '@/utils/notify';
import { i18n } from '@/lang';
import { Theme } from '@directus/shared/types';
import { baseLight, baseDark } from '@/themes';
import { parseTheme } from '@/utils/theming';
import { unflatten, flatten } from 'flat';
import { merge } from 'lodash';
import { deepDiff } from '@/utils/deep-diff-object';

type ThemeVariants = 'dark' | 'light' | string;
type ThemeVersions = 'base' | 'overrides';
type ThemeBase = Record<ThemeVariants, Theme>;
type ThemeOverrides = Partial<Record<ThemeVariants, Theme['theme']>>;

export const SYSTEM_THEME_STYLE_TAG_ID = 'system-themes';
export const THEME_OVERRIDES_STYLE_TAG_ID = 'theme-overrides';

const availableThemes = ['light', 'dark'];

export const useThemeStore = defineStore({
	id: 'themesStore',
	state: () => ({
		themeBase: {} as ThemeBase,
		/** For now, the theme overrides don't need to define the entire theme. Only the alterations. */
		themeOverrides: {} as ThemeOverrides,
		/**
		 * Default to light theme -
		 * This is entirely separate from the active theme in the app (handled by the users store).
		 * We use this property to keep track of the theme currently being edited. When the
		 * Theme Editor module is loaded, this will be updated to initially reflect the user's
		 * currently selected theme (unless a theme is specified in the URL). We can't populate this
		 * on load (nor do we really need to), because the theme store is loaded and active on all
		 * routes, even unauthenticated routes, i.e. the login screen.
		 */
		selectedTheme: 'light',
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
						themeVariables = parseTheme(state.themeOverrides[mode]!);
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
		getMergedTheme: (state) => {
			return (mode: ThemeVariants = 'light') => {
				/**
				 * Base themes store entire theme/metadata (title, desc., etc.), thus, when
				 * targeting `themeBase` we have to get the `theme` sub-property
				 */
				return merge({}, state.themeBase[mode].theme, state.themeOverrides[mode]);
			};
		},
		getThemeFieldValues() {
			return (mode = 'light'): (() => Record<string, any>) => {
				return flatten(this.getMergedTheme(mode as ThemeVariants));
			};
		},
		getBaseThemeFieldValues: (state): (() => Record<string, any>) => {
			return (mode = 'light') => {
				return flatten(state.themeBase[mode].theme);
			};
		},
	},
	actions: {
		/**
		 * Store only stores info from public '/server/info' endpoint. We want themes/styles to
		 * persist when logged out so once we hydrate there's no need to dehydrate.
		 */
		async hydrate() {
			/** Pull in base themes first */
			this.themeBase.dark = baseDark || {};
			this.themeBase.light = baseLight || {};

			/** Get server info to pull overrides */
			const serverInfo = await api.get(`/server/info`, { params: { limit: -1 } });
			const overrides: ThemeOverrides = serverInfo.data.data.project['theme_overrides'] || {};

			this.themeOverrides.dark = overrides.dark || {};
			this.themeOverrides.light = overrides.light || {};
		},

		async populateStyles(styleTagID: string, version: ThemeVersions = 'base') {
			const styleTag: HTMLStyleElement | null = document.querySelector(`style#${styleTagID}`);
			if (!styleTag) {
				return console.error(`Style tag with ID ${styleTagID} does not exist in document`);
			}

			const lightThemeStyle = this.getThemeCSS('light', version) || '';
			const darkThemeStyle = this.getThemeCSS('dark', version) || '';

			styleTag.textContent = `${lightThemeStyle}\n${darkThemeStyle}`;
		},

		/**
		 * When updates are passed, deep object paths are compared to the same
		 * paths in the base themes. The updates are narrowed to only the values
		 * that have been altered, and whose path exists in the base theme. Extra
		 * properties are ignored.
		 *
		 * @param updates Updates object in the form
		 *  {
		 *  	[theme name]: {
		 *  		'full.setting.path': value,
		 *  		...
		 *  	}
		 *  }
		 *
		 */
		async updateThemeOverrides(updates: Record<string, any>) {
			const changes: ThemeOverrides = {};
			for (const theme in updates) {
				if (Object.keys(this.themeBase).includes(theme)) {
					// Unflatten the list of updates
					const expanded: ThemeOverrides = unflatten(updates[theme]);
					// What we send up will completely overwrite the current overrides,
					// so we need to make sure to merge the new overrides into the current
					const mergedOverrides = merge(this.themeOverrides[theme] || {}, expanded);
					// Return edits that differ from base theme
					const diff = deepDiff(this.themeBase[theme as ThemeVariants].theme, mergedOverrides);
					/**
					 * If diff is an empty object, that means the local overrides are
					 * equal to the base theme. In that case, we still want to set it
					 * in changes. Sending up an empty object will delete the
					 * theme's overrides entry from the database.
					 */
					changes[theme as ThemeVariants] = diff;
				}
			}

			try {
				const response = await api.patch(`/settings/themes`, changes);
				this.themeOverrides = response.data.data.theme_overrides;
				notify({
					title: i18n.global.t('theme_update_success'),
				});
				this.populateStyles(THEME_OVERRIDES_STYLE_TAG_ID, 'overrides');
			} catch (err: any) {
				unexpectedError(err);
			}
		},
		setSelectedTheme(theme: string) {
			if (availableThemes.includes(theme)) {
				this.selectedTheme = theme;
			} else {
				this.selectedTheme = availableThemes[0];
			}
		},
	},
});
