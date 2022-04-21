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

<script lang="ts" setup>
import { generateVariant } from '@/utils/theming';
import { ValidationError } from '@directus/shared/types';
import { watch } from 'vue';

interface Props {
	modelValue: string;
	disabled?: boolean;
	validationErrors?: ValidationError[];
	source?: string;
	mix?: string;
	desiredContrast?: number;
	endBuffer?: number;
	baseBuffer?: number;
}
const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false,
	validationErrors: () => [],
	source: '#FFFFFF',
	mix: '#000000',
	desiredContrast: 4.5,
	endBuffer: 0.1,
	baseBuffer: 0.1,
});

const emit = defineEmits(['update:modelValue']);

watch([() => props.source, () => props.mix], ([source, mix]) => {
	const newColor = generateVariant(source, mix, props.desiredContrast, props.endBuffer, props.baseBuffer);
	emit('update:modelValue', newColor);
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
