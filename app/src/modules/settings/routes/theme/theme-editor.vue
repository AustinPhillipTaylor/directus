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

		<div class="theme-options">
			<v-form v-model="edits" :initial-values="initialValues" :fields="themeFields" :primary-key="1" />
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
import { ref, computed, toRefs } from 'vue';
import SettingsNavigation from '../../components/navigation.vue';
import { useServerStore, useThemeStore, THEME_OVERRIDES_STYLE_TAG_ID } from '@/stores';
import useShortcut from '@/composables/use-shortcut';
import useEditsGuard from '@/composables/use-edits-guard';
import { useRouter } from 'vue-router';
import { isArray } from 'lodash';
import { RawField } from '@directus/shared/types';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const router = useRouter();

const serverStore = useServerStore();
const themeStore = useThemeStore();

const themeName = ref(themeStore.selectedTheme);

const { defaultValues, initialValues } = themeStore.getValues(themeName.value);

const themeFields = themeStore.getFields.map((field: Partial<RawField>) => {
	if (field.schema && field.field) {
		if (isArray(defaultValues[field.field])) {
			field.schema.default_value = defaultValues[field.field][0] || '';
		} else {
			field.schema.default_value = defaultValues[field.field] || '';
		}
	}
	if (field.meta && field.field && !field.meta.field) {
		field.meta.field = field.field;
	}
	return field;
});

const edits = ref<{ [key: string]: any } | null>(null);

const hasEdits = computed(() => edits.value !== null && Object.keys(edits.value).length > 0);

const saving = ref(false);

useShortcut('meta+s', () => {
	if (hasEdits.value) save();
});

const { confirmLeave, leaveTo } = useEditsGuard(hasEdits);

async function save() {
	if (edits.value === null) return;
	saving.value = true;
	await themeStore.updateThemeOverrides({ [themeName.value]: edits.value });
	await serverStore.hydrate();
	await themeStore.populateStyles(THEME_OVERRIDES_STYLE_TAG_ID, 'overrides');
	edits.value = null;
	saving.value = false;
}

function discardAndLeave() {
	if (!leaveTo.value) return;
	edits.value = {};
	confirmLeave.value = false;
	router.push(leaveTo.value);
}
</script>

<style lang="scss" scoped>
.theme-options {
	padding: var(--content-padding);
	padding-bottom: var(--content-padding-bottom);
}

.header-icon {
	--v-button-color-disabled: var(--g-color-primary-normal);
	--v-button-background-color-disabled: var(--g-color-primary-subtle);
}
</style>
