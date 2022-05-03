<template>
	<div v-tooltip="fieldData?.name" class="theme-color-picker">
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
				//@ts-ignore
				'--red': inputAsRGB.r,
				'--green': inputAsRGB.g,
				'--blue': inputAsRGB.b,
			}"
		>
			<span class="hex-value">{{ inputValue }}</span>
			<div class="action-buttons">
				<div v-tooltip.instant="t('edit_color_value')" class="icon-hit-area" @click="activateColorPicker">
					<v-icon name="palette" />
				</div>
				<div v-if="defaultValue" v-tooltip.instant="t('reset_to_default')" class="icon-hit-area" @click="setDefault">
					<v-icon name="settings_backup_restore" />
				</div>
				<div v-if="isCopySupported" v-tooltip.instant="t('copy_color_value')" class="icon-hit-area" @click="copyHex">
					<v-icon name="content_copy" />
				</div>
				<div v-if="isPasteSupported" v-tooltip.instant="t('paste_color_value')" class="icon-hit-area" @click="pasteHex">
					<v-icon name="content_paste" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Field, ValidationError } from '@directus/shared/types';
import { computed, ref, Ref } from 'vue';
import Color from 'color';
import useClipboard from '@/composables/use-clipboard';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface Props {
	modelValue: string;
	fieldData?: Field;
	disabled?: boolean;
	validationErrors?: ValidationError[];
	defaultValue?: string;
}
const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	validationErrors: () => [],
	defaultValue: '',
	fieldData: undefined,
});

const emit = defineEmits(['update:modelValue']);

const hiddenSourceInput: Ref<HTMLInputElement | null> = ref(null);

const inputValue = computed(() => {
	return props.modelValue.toUpperCase();
});

const inputAsRGB = computed(() => Color(inputValue.value).rgb().object());

const { copyToClipboard, pasteFromClipboard, isCopySupported, isPasteSupported } = useClipboard();

async function copyHex() {
	await copyToClipboard(inputValue.value);
}

async function pasteHex() {
	const pastedValue = await pasteFromClipboard();
	if (!pastedValue) return;
	emitUpdated(pastedValue);
}

function setDefault() {
	emitUpdated(props.defaultValue as string);
}

function emitUpdated(event: string) {
	emit('update:modelValue', event);
}

function activateColorPicker() {
	hiddenSourceInput.value!.click();
}
</script>

<style lang="scss" scoped>
.theme-color-picker {
	position: relative;
	border: var(--g-border-width) solid var(--g-color-border-normal);
	border-radius: var(--g-border-radius);
	overflow: hidden;
	.theme-source-color-input {
		display: grid;
		width: 100%;
		height: 48px;
		border: var(--g-border-width) solid var(--background-input);
		border-radius: calc(var(--g-border-radius) - 2px);
		align-content: center;
		justify-content: center;
		--r: calc(var(--red) * 0.299);
		--g: calc(var(--green) * 0.587);
		--b: calc(var(--blue) * 0.114);
		--sum: calc(var(--r) + var(--g) + var(--b));
		--perceived-lightness: calc(var(--sum) / 255);
		--threshold: 0.6;
		--offset: calc(var(--perceived-lightness) - var(--threshold));
		--extreme: calc(var(--offset) * -1000000000);
		--bool: clamp(0, var(--extreme), 1);
		.hex-value {
			margin-left: -1px;
			color: hsl(0, 0%, calc(100% * var(--bool)));
		}
		.action-buttons {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			display: none;
			grid-auto-flow: column;
			color: hsl(0, 0%, calc(100% * var(--bool)));
			justify-content: center;
			align-items: center;
			.icon-hit-area {
				display: grid;
				height: 100%;
				padding: 4px;
				align-items: center;
				opacity: 0.5;
				cursor: pointer;
				&:hover {
					opacity: 1;
				}
			}
		}
		&:hover {
			.action-buttons {
				display: grid;
				background: transparent;
			}
			.hex-value {
				display: none;
			}
		}
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
