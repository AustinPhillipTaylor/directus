<template>
	<div class="theme-generated-color">
		<div
			class="theme-generated-color-display"
			:style="{
				'background-color': modelValue || '#cccccc',
			}"
		></div>
	</div>
</template>

<script lang="ts">
import { generateVariant } from '@/utils/theming';
import { ValidationError } from '@directus/shared/types';
import { defineComponent, PropType, watch } from 'vue';
export default defineComponent({
	props: {
		source: {
			type: String,
			required: false,
			default: () => '#ffffff',
		},
		mix: {
			type: String,
			required: false,
			default: () => '#000000',
		},
		desiredContrast: {
			type: Number,
			required: false,
			default: () => 4.5,
		},
		endBuffer: {
			type: Number,
			required: false,
			default: () => 0.1,
		},
		baseBuffer: {
			type: Number,
			required: false,
			default: () => 0.1,
		},
		modelValue: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		validationErrors: {
			type: Array as PropType<ValidationError[]>,
			default: () => [],
		},
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		watch([() => props.source, () => props.mix], ([source, mix]) => {
			const newColor = generateVariant(source, mix, props.desiredContrast, props.endBuffer, props.baseBuffer);
			emit('update:modelValue', newColor);
		});
	},
});
</script>

<style lang="scss" scoped>
.theme-generated-color {
	border: var(--g-border-width) solid var(--g-color-border-normal);
	border-radius: var(--g-border-radius);
	overflow: hidden;
	width: 40px;
	height: 40px;
	display: inline-block;
	margin: 4px 8px 0 0;
	.theme-generated-color-display {
		width: 100%;
		height: 100%;
		display: block;
		border: var(--g-border-width) solid var(--background-input);
		border-radius: calc(var(--g-border-radius) - 2px);
	}
}
</style>
