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
				<div
					:class="[
						'theme-card',
						{
							'current-theme': currentTheme === 'light',
						},
					]"
				>
					<router-link to="./light">
						<!-- eslint-disable-next-line vue/no-v-html -->
						<div v-if="isSVG(ThemePreview)" class="preview-thumbnail theme-light" v-html="ThemePreview" />
						<div class="card-info">Light Theme</div>
					</router-link>
				</div>
				<div
					:class="[
						'theme-card',
						{
							'current-theme': currentTheme === 'dark',
						},
					]"
				>
					<router-link to="./dark">
						<!-- eslint-disable-next-line vue/no-v-html -->
						<div v-if="isSVG(ThemePreview)" class="preview-thumbnail theme-dark" v-html="ThemePreview" />
						<div class="card-info">Dark Theme</div>
					</router-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
// @ts-expect-error: Errors without '*.svg' type declaration
import ThemePreview from '../assets/theme-preview.svg?raw';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface Props {
	currentTheme?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
	currentTheme: 'light',
});

function isSVG(path: string) {
	return path.startsWith('<svg');
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/form-grid';
.theme-selection {
	padding: var(--content-padding);
	.theme-previews {
		display: flex;
		grid-gap: 32px;
		flex-direction: row;

		.theme-card {
			display: flex;
			flex-direction: column;
			flex: auto;
			min-width: 200px;
			max-width: 240px;
			overflow: hidden;
			border: none;
			cursor: pointer;

			&.current-theme {
				border-color: var(--g-color-primary-normal);
				.card-info {
					color: var(--g-color-primary-normal);
				}
				.preview-thumbnail {
					border-color: var(--g-color-primary-normal);
				}
			}

			&:not(.current-theme) {
				&:hover {
					color: var(--g-color-primary-normal);
					.preview-thumbnail {
						border-color: var(--g-color-primary-normal);
					}
					.card-info {
						color: var(--g-color-foreground-accent);
					}
				}
				&:active {
					color: var(--g-color-primary-normal);
					.preview-thumbnail {
						border-color: var(--g-color-primary-accent);
					}
					.card-info {
						color: var(--g-color-foreground-normal);
					}
				}
			}

			.preview-thumbnail {
				width: 100%;
				height: auto;
				font-size: 0;
				line-height: 0;
				border-radius: var(--g-border-radius);
				border: var(--g-border-width) solid var(--g-color-foreground-subtle);
				overflow: hidden;
			}

			.card-info {
				display: flex;
				align-items: center;
				width: 100%;
				height: 20px;
				margin-top: 2px;
				overflow: hidden;
				line-height: 1.3em;
				white-space: nowrap;
				text-overflow: ellipsis;
				color: var(--g-color-foreground-normal);
			}
		}
	}
}

.grid {
	@include form-grid;
}
.divider {
	margin-top: 40px;
}
</style>
