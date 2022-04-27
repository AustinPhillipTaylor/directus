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
		<template v-for="(curField, index) in generatedColorMeta" :key="index">
			<div class="theme-generated-color">
				<div
					class="theme-generated-color-display"
					:style="{
						'background-color': curField.value || '#cccccc',
					}"
				></div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { Field, ValidationError } from '@directus/shared/types';
import { computed, ref, Ref, watch } from 'vue';
import { merge, throttle } from 'lodash';
import { generateVariant } from '@/utils/theming';

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

const sourceValue = ref(sourceField?.field && getThemeSetting(sourceField?.field));

watch(
	() => props.values,
	(values) => {
		const updatedSource = sourceField?.field && values[sourceField?.field];
		if (updatedSource) {
			sourceValue.value = updatedSource;
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

const generatedColorMeta: Ref<Record<string, any>> = ref({});

// Populate initial generated values
for (const field of generatedFields) {
	generatedColorMeta.value[field.field] = {
		value: computed(() => getThemeSetting(field.field)),
		source: sourceValue,
		mix: computed(() => getThemeSetting(field.meta?.options?.mix)),
		desiredContrast: field.meta?.options?.desiredContrast,
		baseBuffer: field.meta?.options?.baseBuffer,
		endBuffer: field.meta?.options?.endBuffer,
	};
}

/**
 * Throttle color generation to avoid too many expensive operations while
 * dragging color picker.
 */
const throttledGeneration = throttle(
	() => {
		for (const field of generatedFields) {
			generateColor(field.field);
		}
		applyAndReset();
	},
	150,
	{ trailing: true }
);

function generateColor(fieldName: string) {
	const colorMeta = generatedColorMeta.value[fieldName];
	const newColor = generateVariant(
		colorMeta.source,
		colorMeta.mix,
		colorMeta.desiredContrast,
		colorMeta.endBuffer,
		colorMeta.baseBuffer
	);

	queueEdits({ [fieldName]: newColor });
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

function updateSource(update: Record<string, any>) {
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

	// loop through generated fields to queue updates
	throttledGeneration();

	applyAndReset();
}

function applyAndReset() {
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
