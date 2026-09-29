<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-lg">{{ t('settings.title') }}</div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-card flat class="km-card q-pa-lg">
          <div class="text-h6 q-mb-md">{{ t('settings.interface') }}</div>
          <q-select
            v-model="language"
            outlined
            :options="languages"
            emit-value
            map-options
            :label="t('settings.language')"
            class="q-mb-md"
            @update:model-value="setLanguage"
          />
          <q-select
            v-model="selectedSkin"
            outlined
            :options="skinOptions"
            emit-value
            map-options
            :label="t('common.skin')"
            @update:model-value="applySkin"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat class="km-card q-pa-lg">
          <div class="text-h6 q-mb-md">{{ t('settings.branding') }}</div>
          <div class="row items-center q-gutter-md">
            <img :src="company.logo" alt="Company logo" class="company-logo" />
            <div>
              <div class="text-subtitle1 text-weight-medium">{{ company.name }}</div>
              <div class="km-muted text-caption">Company branding Mock</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../../composables/useAuthorization';
import { useUi } from '../../composables/useUi';
import { skins } from '../../themes/skins';
import type { SkinId } from '../../types/ui';

const { t, locale } = useI18n();
const { company } = useAuth();
const { applySkin, setLanguage } = useUi();
const language = ref(locale.value);
const selectedSkin = ref<SkinId>('default');
const languages = computed(() => [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
]);
const skinOptions = Object.values(skins).map((skin) => ({
  label: t(skin.nameKey),
  value: skin.id,
}));
</script>

<style scoped>
.company-logo {
  width: 72px;
  max-height: 48px;
  object-fit: contain;
}
</style>
