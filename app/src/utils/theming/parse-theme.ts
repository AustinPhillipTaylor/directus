import { Theme } from '@directus/shared/types';
import { flatten } from 'flat';
import { isArray } from 'lodash';

function listFromObj(object: Record<any, any> = {}, prefix = '', suffix = '', join = '-') {
	/** First we'll flatten object */
	const flattenedObject: Record<string, any> = flatten(object, {
		delimiter: join,
		safe: true, // Preserve array keys
	});

	/** Map the object to an array, add prefix/suffix */
	const cssVars: string[] = Object.keys(flattenedObject).map((key) => {
		let value = flattenedObject[key];
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

export default function parseTheme(theme: Theme['theme']): string {
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
