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
			@update:model-value="updateSource($event)"
		/>
		<template v-for="(curField, index) in generatedFields" :key="index">
			<theme-color-generator
				:source="generatedFieldValues[curField.field].source"
				:mix="generatedFieldValues[curField.field].mix"
				:desired-contrast="curField.meta?.options?.desiredContrast"
				:base-buffer="curField.meta?.options?.baseBuffer"
				:end-buffer="curField.meta?.options?.endBuffer"
				:model-value="generatedFieldValues[curField.field].value"
				@update:model-value="queueEdits({ [curField.field]: $event })"
			></theme-color-generator>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { Field, ValidationError } from '@directus/shared/types';
import { computed, nextTick, ref, Ref, watch } from 'vue';
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

const edits = ref<{ [key: string]: any } | null>(null);

const sourceField = props.fields.find((field) => {
	return field.meta?.options?.source === true;
});

const sourceValue = ref(
	(sourceField?.field && props.values[sourceField?.field]) || getThemeSetting(sourceField?.field)
);

watch(
	() => props.values,
	(values) => {
		const value = sourceField?.field && values[sourceField?.field];
		if (value) {
			sourceValue.value = value;
		}
	}
);

const editableFields = props.fields.filter((field) => {
	return !(field.meta?.options?.generated === true);
});

const generatedFields = props.fields.filter((field) => {
	// We need a source to generate from
	if (!sourceField) return false;
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
		value: computed(() => props.values[field.field] || getThemeSetting(field.field)),
		source: sourceValue,
		mix: computed(() => getThemeSetting(field.meta?.options?.mix)),
	};
}

function getThemeSetting(field?: string) {
	return props.values[field!] || props.initialValues[field!] || undefined;
}

function queueEdits(update: { [key: string]: any }) {
	if (!edits.value) edits.value = {};
	edits.value = {
		...edits.value,
		...update,
	};
}

async function updateSource(update: Record<string, any>) {
	if (!sourceField?.field) return;
	if (!update[sourceField.field]) {
		edits.value = null;
		emit('apply', {});
		return;
	}

	// Update may include all values in group, however, we only want the source field.
	const sourceUpdate = { [sourceField.field]: update[sourceField.field] };

	// Update the sourceValue ref to trigger a re-generation of the color generators
	sourceValue.value = update[sourceField.field];

	// Add source field change to queue
	queueEdits(sourceUpdate);

	/**
	 * Wait for DOM to update (using `nextTick`) so all generated fields in `v-for` can emit
	 * their generated values. The `theme-color-generator` invokes `queueEdits()` on
	 * `modelValue` updates. As a result, once we pass `nextTick`, edits from the source
	 * and all generators dependent on the source will be queued in `edits.value`.
	 */
	await nextTick();
	const newValues = merge(props.values, edits.value || {});
	edits.value = null;
	emit('apply', newValues);
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
