import { defineInterface } from '@directus/shared/utils';
import InterfaceThemeColorGroup from './theme-color-group.vue';

export default defineInterface({
	id: 'theme-color-group',
	name: '$t:interfaces.system-theme.color_group',
	icon: 'palette',
	component: InterfaceThemeColorGroup,
	types: ['alias'],
	options: [],
	system: true,
});
