import { Theme } from '@directus/shared/types';
import { flatten } from 'flat';
import { get, isArray } from 'lodash';

// Convert object to keys of flattened object paths, and values of valid CSS strings
function resolveCSSValues(object: Record<any, any> = {}, prefix = '', suffix = '', join = '-') {
	/** First we'll flatten object */
	const flatObj: Record<string, any> = flatten(object, {
		delimiter: join,
		safe: true, // Preserve array keys
	});

	/** Map the object to an array, add prefix/suffix */
	const cssVars: string[] = Object.keys(flatObj).map((key) => {
		let value = flatObj[key];
		// Concatenate arrays
		if (isArray(value)) {
			value = value.join(', ');
		}
		// Convert numbers to pixel values
		else if (!isNaN(Number(value))) {
			value = `${value}px`;
		}
		return `${prefix}${key}: ${value}${suffix}`;
	});

	return cssVars;
}

// Output text block of CSS variables
export function resolveThemeVariables(theme: Theme['theme']): string {
	const outputVariables: string[] = [];

	if (theme.global) {
		/** Resolve all global variables first, prepend --g- */
		outputVariables.push(...resolveCSSValues(theme.global, '--g-', ';', '-'));
	}
	if (theme.components) {
		/** Next, resolve the components variables */
		outputVariables.push(...resolveCSSValues(theme.components, '--', ';', '-'));
	}

	// Join variables
	return outputVariables.join('\n');
}

// Convert object to keys of flattened object paths, and values of string | number
export function resolveFieldValues(object: Record<any, any> = {}) {
	const flatObj: Record<string, any> = flatten(object, { safe: true });

	const values = Object.keys(flatObj).reduce<Record<string, any>>((acc, key) => {
		// If value is array, return first item
		if (isArray(flatObj[key])) {
			acc[key] = flatObj[key][0];
		} else {
			acc[key] = flatObj[key];
		}
		return acc;
	}, {});

	return values;
}

export function resolveFontLink(fontNames: string[]) {
	const linkPrefix = 'https://fonts.googleapis.com/css2?';
	const linkSuffix = '&display=swap';
	const famPrefix = 'family=';
	const axisAndTuple = ':wght@300..800';

	const specList = fontNames.map((font) => {
		const name = font.trim().replaceAll(' ', '+');
		return famPrefix + name + axisAndTuple;
	});

	return linkPrefix + specList.join('&') + linkSuffix;
}

export function extractFontsFromTheme(theme: Partial<Theme['theme']> = {}, exclude: string[] = []) {
	const fontPaths = ['global.font.family.sans', 'global.font.family.serif', 'global.font.family.mono'];
	const externalFonts = [];
	for (const path of fontPaths) {
		const fontSetting = get(theme, path, null);

		if (!fontSetting) continue;
		if (typeof fontSetting === 'string' && !exclude.includes(fontSetting)) {
			externalFonts.push(fontSetting);
		}
		if (isArray(fontSetting)) {
			for (const nestedFontSetting of fontSetting) {
				if (typeof nestedFontSetting === 'string' && !exclude.includes(nestedFontSetting)) {
					externalFonts.push(nestedFontSetting);
				}
			}
		}
	}
	return externalFonts;
}
