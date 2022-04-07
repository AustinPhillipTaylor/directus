<template>
	<div class="theme-color-picker">
		<input
			ref="hiddenSourceInput"
			:value="inputValue"
			type="color"
			class="hidden-input"
			@input="emitUpdated(($event.target as HTMLInputElement).value)"
		/>
		<div
			class="theme-source-color-input"
			:style="{
				'background-color': inputValue || '#cccccc',
			}"
			@click="activateColorPicker"
		></div>
	</div>
</template>

<script lang="ts">
import { ValidationError } from '@directus/shared/types';
import { computed, defineComponent, PropType, ref, Ref } from 'vue';
export default defineComponent({
	props: {
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
		const hiddenSourceInput: Ref<HTMLInputElement | null> = ref(null);

		const inputValue = computed(() => {
			return props.modelValue;
		});

		return {
			inputValue,
			emitUpdated,
			hiddenSourceInput,
			activateColorPicker,
		};

		function emitUpdated(event: string) {
			emit('update:modelValue', event);
		}

		function activateColorPicker() {
			hiddenSourceInput.value!.click();
		}
	},
});
</script>

<style lang="scss" scoped>
.theme-color-picker {
	position: relative;
	border: var(--g-border-width) solid var(--g-color-border-normal);
	border-radius: var(--g-border-radius);
	overflow: hidden;
	.theme-source-color-input {
		display: block;
		width: 100%;
		height: 40px;
		border: var(--g-border-width) solid var(--background-input);
		border-radius: calc(var(--g-border-radius) - 2px);
	}
}
.hidden-input {
	width: 0;
	height: 0;
	visibility: hidden;
	position: absolute;
	top: 0;
	right: 0;
}
</style>
