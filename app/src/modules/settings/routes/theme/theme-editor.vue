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

		<theme-selection :current-theme="selectedTheme"></theme-selection>

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
import { ref, computed, watch } from 'vue';
import SettingsNavigation from '../../components/navigation.vue';
import ThemeSelection from './components/theme-selection.vue';
import { useServerStore, useThemeStore, THEME_OVERRIDES_STYLE_TAG_ID } from '@/stores';
import useShortcut from '@/composables/use-shortcut';
import useEditsGuard from '@/composables/use-edits-guard';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const serverStore = useServerStore();
const themeStore = useThemeStore();

const { selectedTheme } = storeToRefs(themeStore);

const initialValues = ref(themeStore.getInitialValues(selectedTheme.value));

const themeFields = ref(themeStore.getFields(selectedTheme.value));

const edits = ref<{ [key: string]: any } | null>(null);

const hasEdits = computed(() => edits.value !== null && Object.keys(edits.value).length > 0);

const saving = ref(false);

useShortcut('meta+s', () => {
	if (hasEdits.value) save();
});

const { confirmLeave, leaveTo } = useEditsGuard(hasEdits);

watch(
	() => route.params.theme,
	(newTheme) => {
		themeStore.setSelectedTheme(newTheme);
		themeFields.value = themeStore.getFields(selectedTheme.value);
		initialValues.value = themeStore.getInitialValues(selectedTheme.value);
		edits.value = null;
	}
);

async function save() {
	if (edits.value === null) return;
	saving.value = true;
	await themeStore.updateThemeOverrides({ [selectedTheme.value]: edits.value });
	initialValues.value = themeStore.getInitialValues(selectedTheme.value);
	await serverStore.hydrate();
	await themeStore.populateStyles(THEME_OVERRIDES_STYLE_TAG_ID, 'overrides');
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
}

.header-icon {
	--v-button-color-disabled: var(--g-color-primary-normal);
	--v-button-background-color-disabled: var(--g-color-primary-subtle);
}
</style>
