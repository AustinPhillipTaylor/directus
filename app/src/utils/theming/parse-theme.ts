import { Theme } from '@directus/shared/types';

function flattenObject(object: Record<any, any> = {}, join = '-') {
	const result: Record<string, any> = {};
	/** loop through the object */
	for (const key in object) {
		if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
			const temp = flattenObject(object[key]);
			for (const subKey in temp) {
				/** Store temp in result */
				result[key + join + subKey] = temp[subKey];
			}
		} else {
			/** No more nested objects, store value */
			result[key] = object[key];
		}
	}
	return result;
}

function listFromObj(object: Record<any, any> = {}, prefix = '', suffix = '', join = '-') {
	/** First we'll flatten object */
	const flattenedObject = flattenObject(object, join);

	/** Next we'll map the object to an array and prefix/suffix */
	const list: string[] = Object.keys(flattenedObject).map((key) => `${prefix}${key}: ${flattenedObject[key]}${suffix}`);

	return list;
}

export default function parseTheme(theme: Theme['theme']): string {
	/** NOTE: Should probably use something like AJV to validate the theme schema */

	const outputVariables: string[] = [];

	if (theme.global) {
		/** Resolve all global variables first, prepend --g- */
		outputVariables.push(...listFromObj(theme.global, '--g-', ';', '-'));
	}
	if (theme.components) {
		/** Next, resolve the components variables */
		outputVariables.push(...listFromObj(theme.components, '--', ';', '-'));
	}

	// Join variables
	return outputVariables.join('\n');
}
