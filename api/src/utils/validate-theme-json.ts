import Joi from 'joi';
import { Theme } from '@directus/shared/types';

/**
 * The following Joi definitions align with the theme
 * type definition in shared > types > theme.ts
 */

// Matches hex values i.e. #000000
const hex = Joi.string()
	.trim()
	.pattern(/^#(([\da-fA-F]{3}){1,2}|([\da-fA-F]{4}){1,2})$/, 'Hexadecimal color');
// Matched css variable references i.e. var( --g-color-background-normal )
const link = Joi.string()
	.trim()
	.pattern(/^var\(\s*--[-\w]+\s*\)$/, 'CSS variable link');
// Matches a pixel amount i.e. 16px
const pixels = Joi.string()
	.trim()
	.pattern(/^\d*px$/, 'Amount in pixels');

const baseColorVariants = Joi.object({
	normal: Joi.alternatives([hex, link]),
	accent: Joi.alternatives([hex, link]),
	subtle: Joi.alternatives([hex, link]),
});

const globalSettings = Joi.object({
	font: Joi.object({
		size: pixels,
		family: Joi.object({
			sans: Joi.string(),
			serif: Joi.string(),
			mono: Joi.string(),
		}),
	}),
	color: Joi.object({
		primary: baseColorVariants,
		secondary: baseColorVariants,
		warning: baseColorVariants,
		danger: baseColorVariants,
		foreground: baseColorVariants.append({
			invert: Joi.alternatives([hex, link]),
		}),
		background: baseColorVariants.append({
			page: Joi.alternatives([hex, link]),
			invert: Joi.alternatives([hex, link]),
		}),
		border: baseColorVariants,
	}),
	border: Joi.object({
		width: pixels,
		radius: pixels,
	}),
});

const subProperty = Joi.object()
	.pattern(/./, Joi.alternatives([Joi.string(), pixels, hex, link, Joi.link('#subProperty')]))
	.id('subProperty');

const componentSettings = Joi.object().pattern(/./, subProperty);

const themeSettings = Joi.object({
	global: globalSettings,
	components: componentSettings,
});

const themeList = Joi.object().pattern(/./, themeSettings);

export function isValidThemeJson(themeJson: Record<any, Theme['theme']>) {
	const { error } = themeList.validate(themeJson, { abortEarly: true });
	return error;
}
