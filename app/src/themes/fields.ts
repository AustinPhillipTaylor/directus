import { RawField } from '@directus/shared/types';
import { merge } from 'lodash';
import { i18n } from '@/lang';
const { t } = i18n.global;

export const fields: Partial<RawField>[] = [
	/* ---------- Colors ---------- */
	divider('colors_divider', 'sections.colors.title'),
	description('colors_description', 'sections.colors.description'),
	/* ---------- Primary Color Group  ---------- */
	...themeColorGroup('colors_primary', [
		colorSource('global.color.primary.normal', 'colors.primary_normal'),
		generatedColor('global.color.primary.accent', 'colors.primary_accent', 'global.color.background.invert'),
		generatedColor('global.color.primary.subtle', 'colors.primary_subtle', 'global.color.background.page', {
			desiredContrast: 4.7,
		}),
	]),
	/* ---------- Secondary Color Group  ---------- */
	...themeColorGroup('colors_secondary', [
		colorSource('global.color.secondary.normal', 'colors.secondary_normal'),
		generatedColor('global.color.secondary.accent', 'colors.secondary_accent', 'global.color.background.invert'),
		generatedColor('global.color.secondary.subtle', 'colors.secondary_subtle', 'global.color.background.page', {
			desiredContrast: 4.7,
		}),
	]),
	/* ---------- Success Color Group  ---------- */
	...themeColorGroup('colors_success', [
		colorSource('global.color.success.normal', 'colors.success_normal'),
		generatedColor('global.color.success.accent', 'colors.success_accent', 'global.color.background.invert'),
		generatedColor('global.color.success.subtle', 'colors.success_subtle', 'global.color.background.page', {
			desiredContrast: 4.7,
		}),
	]),
	/* ---------- Warning Color Group  ---------- */
	...themeColorGroup('colors_warning', [
		colorSource('global.color.warning.normal', 'colors.warning_normal'),
		generatedColor('global.color.warning.accent', 'colors.warning_accent', 'global.color.background.invert'),
		generatedColor('global.color.warning.subtle', 'colors.warning_subtle', 'global.color.background.page', {
			desiredContrast: 4.7,
			endBuffer: 0.15,
		}),
	]),
	/* ---------- Danger Color Group  ---------- */
	...themeColorGroup('colors_danger', [
		colorSource('global.color.danger.normal', 'colors.danger_normal'),
		generatedColor('global.color.danger.accent', 'colors.danger_accent', 'global.color.background.invert'),
		generatedColor('global.color.danger.subtle', 'colors.danger_subtle', 'global.color.background.page', {
			desiredContrast: 4.7,
			endBuffer: 0.45,
		}),
	]),
	/* ---------- Foreground  ---------- */
	divider('foreground_divider', 'sections.foreground.title'),
	description('foreground_description', 'sections.foreground.description'),
	dropdown('global.font.family.sans', 'font.sans', true, [
		['Inter'],
		['Open Sans'],
		['Fira Sans'],
		['Noto Sans'],
		['Roboto'],
		['Merriweather Sans'],
	]),
	dropdown('global.font.family.serif', 'font.serif', true, [
		['Merriweather'],
		['Playfair Display'],
		['Noto Serif'],
		['Source Serif Pro'],
		['Roboto Serif'],
		['Roboto Slab'],
	]),
	dropdown('global.font.family.mono', 'font.mono', true, [
		['Fira Mono'],
		['Fira Code'],
		['Source Code Pro'],
		['Roboto Mono'],
		['JetBrains Mono'],
		['Noto Sans Mono'],
	]),
	color('global.color.foreground.normal', 'colors.foreground_normal'),
	color('global.color.foreground.accent', 'colors.foreground_accent'),
	color('global.color.foreground.subtle', 'colors.foreground_subtle'),
	color('global.color.foreground.invert', 'colors.foreground_invert'),
	/* ---------- Background  ---------- */
	divider('background_divider', 'sections.background.title'),
	description('background_description', 'sections.background.description'),
	color('global.color.background.normal', 'colors.background_normal'),
	color('global.color.background.accent', 'colors.background_accent'),
	color('global.color.background.subtle', 'colors.background_subtle'),
	color('global.color.background.page', 'colors.background_page'),
	color('global.color.background.invert', 'colors.background_invert'),
	/* ---------- Border  ---------- */
	divider('border_divider', 'sections.border.title'),
	description('border_description', 'sections.border.description'),
	integer('global.border.width', 'border.width', 0, 2),
	integer('global.border.radius', 'border.radius', 0, 16),
	color('global.color.border.normal', 'colors.border_normal'),
	color('global.color.border.accent', 'colors.border_accent'),
	color('global.color.border.subtle', 'colors.border_subtle'),
	/* ---------- Text Styles  ---------- */
	// divider('text_styles_divider', 'sections.text_styles.title'),
	// description('text_styles_description', 'sections.text_styles.description'),
	/* ---------- Module Bar  ---------- */
	divider('module_divider', 'sections.module.title'),
	description('module_description', 'sections.module.description'),

	color('components.module.background.normal', 'colors.module_background_normal'),
	color('components.module.foreground.normal', 'colors.module_foreground_normal'),

	color('components.module.background.hover', 'colors.module_background_hover'),
	color('components.module.foreground.hover', 'colors.module_foreground_hover'),

	color('components.module.background.active', 'colors.module_background_active'),
	color('components.module.foreground.active', 'colors.module_foreground_active'),
];

function integer(fieldId: string, namePath: string, min: number, max: number) {
	const base = baseField(fieldId, namePath);
	const overrides = {
		type: 'integer',
		meta: {
			options: {
				min,
				max,
			},
		},
		schema: {
			default_value: 0,
		},
	};
	return merge({}, base, overrides);
}

/**
 * Choices is an array containing arrays of 1 or 2 strings. A single string will set the
 * text and value to be equal on that choice. Tuples will map to [text, value].
 */
function dropdown(fieldId: string, namePath: string, allowCustom = false, choices: [string, string?][] = [['Value']]) {
	const base = baseField(fieldId, namePath);
	const resolvedChoices = choices.reduce<{ text: string; value: string }[]>((acc, choice) => {
		acc.push({
			text: choice[0],
			value: choice[1] ?? choice[0],
		});
		return acc;
	}, []);
	const overrides = {
		meta: {
			interface: 'select-dropdown',
			options: {
				allowOther: allowCustom,
				choices: resolvedChoices,
			},
		},
	};
	return merge({}, base, overrides);
}

function colorSource(fieldId: string, namePath: string) {
	const base = color(fieldId, namePath);
	const overrides = {
		meta: {
			options: {
				source: true,
			},
		},
	};
	return merge({}, base, overrides);
}

function color(fieldId: string, namePath: string) {
	const base = baseField(fieldId, namePath);
	const overrides = {
		meta: {
			interface: 'theme-color-picker',
		},
		schema: {
			default_value: '#cccccc',
		},
	};
	return merge({}, base, overrides);
}

function generatedColor(fieldId: string, namePath: string, mixFieldId: string, options = {}) {
	const base = baseField(fieldId, namePath);
	const overrides = {
		meta: {
			interface: null,
			options: {
				mix: mixFieldId,
				generated: true,
				...merge(
					{
						desiredContrast: 1.35,
						endBuffer: 0.2,
						baseBuffer: 0.2,
					},
					options
				),
			},
			schema: {
				default_value: '#cccccc',
			},
		},
	};
	return merge({}, base, overrides);
}

function themeColorGroup(groupId: string, items: RawField[]) {
	return group(groupId, 'theme-color-group', items);
}

function group(groupId: string, fieldInterface: string, items: RawField[]): RawField[] {
	const base = baseField(groupId);
	const overrides = {
		type: 'alias',
		meta: {
			interface: fieldInterface,
			special: ['alias', 'no-data', 'group'],
		},
	};
	const groupAlias = merge({}, base, overrides);
	const groupAppliedFields = items.map((field) => {
		if (field.meta) field.meta.group = groupId;
		return field;
	});
	return [groupAlias, ...groupAppliedFields];
}

function divider(fieldId: string, titlePath: string): RawField {
	const base = baseField(fieldId);
	const overrides = {
		type: 'alias',
		meta: {
			interface: 'presentation-divider',
			options: {
				title: titlePath ? _t(titlePath) : '',
				inlineTitle: true,
			},
			special: ['alias', 'no-data'],
			width: 'full',
		},
	};
	return merge({}, base, overrides);
}

function description(fieldId: string, textPath: string): RawField {
	const base = baseField(fieldId);
	const overrides = {
		type: 'alias',
		meta: {
			interface: 'presentation-text-block',
			options: {
				text: textPath ? _t(textPath) : '',
			},
			special: ['alias', 'no-data'],
			width: 'full',
		},
	};
	return merge({}, base, overrides);
}

function baseField(fieldId: string, namePath = '') {
	const base: RawField = {
		field: fieldId,
		type: 'string',
		name: namePath ? _t(namePath) : '',
		meta: {
			field: fieldId,
			interface: 'input',
		},
		schema: {
			is_nullable: false,
			default_value: '',
		},
	};
	return base;
}

// Get translations at theme_overrides path
function _t(subPath: string) {
	const path = 'field_options.directus_settings.theme_overrides';
	return t(`${path}.${subPath}`);
}
