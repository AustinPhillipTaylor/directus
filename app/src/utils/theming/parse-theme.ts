import { Theme } from '@directus/shared/types';
import { flatten } from 'flat';

function listFromObj(object: Record<any, any> = {}, prefix = '', suffix = '', join = '-') {
	/** First we'll flatten object */
	const flattenedObject: Record<string, any> = flatten(object, { delimiter: join });

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
