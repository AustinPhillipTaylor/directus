<template>
	<div class="theme-selection">
		<div class="grid with-fill">
			<v-divider
				class="divider full"
				:style="{
					'--v-divider-color': 'var(--g-color-border-subtle)',
				}"
				large
				:inline-title="true"
			>
				<template #default>
					{{ t('field_options.directus_settings.theme_overrides.sections.select_theme.title') }}
				</template>
			</v-divider>
			<div class="theme-previews full">
				<!-- eslint-disable-next-line vue/no-v-html -->
				<span v-if="isSVG(ThemePreview)" class="preview-thumbnail theme-light half" v-html="ThemePreview" />
				<!-- eslint-disable-next-line vue/no-v-html -->
				<span v-if="isSVG(ThemePreview)" class="preview-thumbnail theme-dark half-right" v-html="ThemePreview" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import ThemePreview from '../assets/theme-preview.svg?raw';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

function isSVG(path: string) {
	return path.startsWith('<svg');
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/form-grid';
.theme-selection {
	padding: var(--content-padding);
	.theme-previews {
		display: contents;
	}

	.preview-thumbnail {
		justify-self: center;
	}
}

.grid {
	@include form-grid;
}
.divider {
	margin-top: 40px;
}
</style>
