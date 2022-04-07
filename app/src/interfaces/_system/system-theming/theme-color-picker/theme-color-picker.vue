<template>
	<theme-color-picker :model-value="value" @update:model-value="$emit('input', $event)"></theme-color-picker>
</template>

<script lang="ts">
import { ValidationError } from '@directus/shared/types';
import { defineComponent, PropType } from 'vue';
import themeColorPicker from '../components/theme-color-picker.vue';
export default defineComponent({
	name: 'ThemeColorPickerGroup',
	components: { themeColorPicker },
	props: {
		field: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		batchMode: {
			type: Boolean,
			default: false,
		},
		batchActiveFields: {
			type: Array as PropType<string[]>,
			default: () => [],
		},
		primaryKey: {
			type: [Number, String],
			required: true,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		validationErrors: {
			type: Array as PropType<ValidationError[]>,
			default: () => [],
		},
	},
	emits: ['input'],
});
</script>

<style lang="scss" scoped>
.hidden-input {
	width: 0;
	height: 0;
	visibility: hidden;
}
.theme-source-color-input {
	display: block;
	height: 40px;
	border-radius: var(--g-border-radius);
}
</style>
