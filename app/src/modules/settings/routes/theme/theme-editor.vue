<template>
	<private-view :title="t('settings_theme')">
		<template #headline><v-breadcrumb :items="[{ name: t('settings'), to: '/settings' }]" /></template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon>
				<v-icon name="palette" />
			</v-button>
		</template>

		<template #actions>
			<v-button v-tooltip.bottom="t('save')" icon rounded :disabled="!hasEdits" :loading="saving" @click="save">
				<v-icon name="check" />
			</v-button>
		</template>

		<template #navigation>
			<settings-navigation />
		</template>

		<theme-selection :current-theme="editingTheme"></theme-selection>

		<div class="theme-options">
			<v-form ref="themeForm" v-model="edits" :initial-values="initialValues" :fields="themeFields" :primary-key="1" />
		</div>

		<template #sidebar>
			<sidebar-detail icon="info_outline" :title="t('information')" close>
				<div v-md="t('page_help_settings_theming')" class="page-description" />
			</sidebar-detail>
		</template>

		<v-dialog v-model="confirmLeave" @esc="confirmLeave = false">
			<v-card>
				<v-card-title>{{ t('unsaved_changes') }}</v-card-title>
				<v-card-text>{{ t('unsaved_changes_copy') }}</v-card-text>
				<v-card-actions>
					<v-button secondary @click="discardAndLeave">
						{{ t('discard_changes') }}
					</v-button>
					<v-button @click="confirmLeave = false">{{ t('keep_editing') }}</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</private-view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import SettingsNavigation from '../../components/navigation.vue';
import ThemeSelection from './components/theme-selection.vue';
import { useServerStore, useThemeStore } from '@/stores';
import useShortcut from '@/composables/use-shortcut';
import useEditsGuard from '@/composables/use-edits-guard';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { assign, pick } from 'lodash';
const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const serverStore = useServerStore();
const themeStore = useThemeStore();

const { editingTheme } = storeToRefs(themeStore);

const initialValues = ref(themeStore.getInitialValues(editingTheme.value));

const themeFields = ref(themeStore.getFields(editingTheme.value));

const themeForm = ref<any>(null);

const edits = ref<{ [key: string]: any } | null>(null);

const hasEdits = computed(() => edits.value !== null && Object.keys(edits.value).length > 0);

const saving = ref(false);

useShortcut('meta+s', () => {
	if (hasEdits.value) save();
});

const { confirmLeave, leaveTo } = useEditsGuard(hasEdits);

onBeforeRouteLeave(() => {
	themeStore.setEditingTheme('light');
	themeStore.setAppTheme();
});

watch(
	() => route.params.theme as string,
	(newTheme) => {
		if (!newTheme) return;
		themeStore.setEditingTheme(newTheme);
		themeStore.setAppTheme(newTheme);
		themeStore.populateFonts(newTheme);
		themeFields.value = themeStore.getFields(editingTheme.value);
		initialValues.value = themeStore.getInitialValues(editingTheme.value);
		edits.value = null;
	}
);

/**
 * Note: because the theme editor uses nested groups, custom handling of `apply` events is necessary
 * until https://github.com/directus/directus/issues/13105 is resolved. Upon resolution, this watcher
 * function can be entirely removed, with no further intervention necessary.
 */
const modifyFormApply = watch(
	() => themeForm.value,
	(form) => {
		// Overwriting the apply logic in the form component
		form.apply = (updates: { [field: string]: any }) => {
			const updatableKeys = themeFields.value
				.filter((field) => {
					if (!field) return false;
					return field.schema?.is_primary_key || !form.isDisabled(field);
				})
				.map((field) => field.field);
			form.$emit('update:modelValue', pick(assign({}, form.$props.modelValue, updates), updatableKeys as string[]));
		};
		modifyFormApply(); // unwatch
	}
);

async function save() {
	if (edits.value === null) return;
	saving.value = true;
	await themeStore.updateThemeOverrides({ [editingTheme.value]: edits.value });
	initialValues.value = themeStore.getInitialValues(editingTheme.value);
	await serverStore.hydrate();
	await themeStore.populateStyles();
	await themeStore.populateFonts(editingTheme.value);
	edits.value = null;
	saving.value = false;
}

function discardAndLeave() {
	if (!leaveTo.value) return;
	edits.value = null;
	confirmLeave.value = false;
	router.push(leaveTo.value);
}
</script>

<style lang="scss" scoped>
.theme-options {
	padding: var(--content-padding);
	padding-bottom: var(--content-padding-bottom);
	// .narrow-columns class set in field. Taking advantage of the fact that
	// v-form v-binds all options passed to field.
	:deep(.narrow-columns) {
		& > .grid {
			display: grid;
			grid-template-columns: [start] repeat(auto-fill, [start] minmax(165px, 1fr) [full]) [full];

			& > .full {
				grid-column: auto;
			}
		}
	}
}

.header-icon {
	--v-button-color-disabled: var(--g-color-primary-normal);
	--v-button-background-color-disabled: var(--g-color-primary-subtle);
}
</style>
