<template>
	<div>
		<v-form
			:initial-values="initialValues"
			:fields="editableFields"
			:model-value="values"
			:primary-key="primaryKey"
			:group="field.meta!.field"
			:validation-errors="validationErrors"
			:loading="loading"
			:disabled="disabled"
			nested
			@update:model-value="$emit('apply', $event)"
		/>
		<template v-for="(curField, index) in generatedFields" :key="index">
			<theme-color-generator
				:source="generatedFieldValues[curField.field].source"
				:mix="generatedFieldValues[curField.field].mix"
				:desired-contrast="curField.meta?.options?.desiredContrast"
				:base-buffer="curField.meta?.options?.baseBuffer"
				:end-buffer="curField.meta?.options?.endBuffer"
				:model-value="generatedFieldValues[curField.field].value"
				@update:model-value="apply(curField.field, $event)"
			></theme-color-generator>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { Field, ValidationError } from '@directus/shared/types';
import { computed, ref, Ref } from 'vue';
import themeColorGenerator from '../components/theme-color-generator.vue';
import { merge } from 'lodash';

interface Props {
	values: Record<string, string>;
	disabled?: boolean;
	validationErrors?: ValidationError[];
	field: Field;
	fields: Field[];
	primaryKey: string | number;
	initialValues: Record<string, string>;
	batchMode?: boolean;
	batchActiveFields?: string[];
	loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	validationErrors: () => [],
	batchMode: false,
	batchActiveFields: () => [],
	loading: false,
});

const emit = defineEmits(['apply']);

const source = props.fields.find((field) => {
	return field.meta?.options?.source === true;
});

const editableFields = props.fields.filter((field) => {
	return !(field.meta?.options?.generated === true);
});

const generatedFields = props.fields.filter((field) => {
	// We need a source to generate from
	if (!source) return false;
	return field.meta?.options?.generated === true;
});

const editableFieldValues: Ref<Record<string, any>> = ref({});

for (const field of editableFields) {
	editableFieldValues.value[field.field] = computed(() => {
		return props.values[field.field] || props.initialValues[field.field] || '#cccccc';
	});
}

const generatedFieldValues: Ref<Record<string, any>> = ref({});

for (const field of generatedFields) {
	generatedFieldValues.value[field.field] = {
		value: computed(() => getThemeSetting(field.field)),
		source: computed(() => getThemeSetting(source?.field)),
		mix: computed(() => getThemeSetting(field.meta?.options?.mix)),
	};
}

function apply(field: string, value: string) {
	const newValues = merge(props.values, { [field]: value });
	emit('apply', newValues);
}

function getThemeSetting(field?: string) {
	return props.values[field!] || props.initialValues[field!] || undefined;
}
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
