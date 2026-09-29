<template>
  <q-form ref="formRef" class="step-content" @submit.prevent="continueToDatabase">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">
      {{ t('installation.company.title') }}
    </div>
    <p class="step-description">{{ t('installation.company.description') }}</p>
    <q-input
      :model-value="companyId"
      outlined
      autofocus
      :label="t('installation.company.companyId')"
      :placeholder="t('installation.company.companyIdPlaceholder')"
      :rules="[guidRule]"
      autocomplete="off"
      @update:model-value="emit('update:companyId', String($event ?? ''))"
      @blur="emit('resolve-company')"
    />
    <q-banner v-if="company" rounded class="company-banner q-mt-md">
      <template #avatar><q-icon name="domain" color="primary" /></template>
      <div class="text-weight-medium">{{ company.name }}</div>
      <div class="text-caption">{{ t('installation.company.code') }}: {{ company.code }}</div>
      <div class="text-caption">{{ t('installation.company.companyId') }}: {{ company.id }}</div>
    </q-banner>
    <q-banner v-else-if="companyLookupFailed" rounded class="status-banner q-mt-md">
      <template #avatar><q-icon name="search_off" color="negative" /></template>
      {{ t('installation.company.notFound') }}
    </q-banner>
    <div class="step-actions">
      <q-btn
        color="primary"
        unelevated
        :label="t('common.continue')"
        icon-right="arrow_forward"
        :disable="!company"
        @click="continueToDatabase"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { InstallationCompany } from 'src/models/installation';

defineProps<{
  companyId: string;
  company: InstallationCompany | null;
  companyLookupFailed: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:companyId', value: string): void;
  (event: 'resolve-company'): void;
  (event: 'continue'): void;
}>();

const { t } = useI18n();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const guidRule = (value: string) =>
  /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value) || t('installation.company.invalidId');

async function continueToDatabase(): Promise<void> {
  if (await formRef.value?.validate()) emit('continue');
}
</script>

<style scoped>
.company-banner {
  background: #f1f7f7;
  border-left: 3px solid var(--install-accent);
}

.status-banner {
  background: #fbefed;
  color: #8e3025;
}

.step-content {
  max-width: 650px;
}

.step-description {
  margin: 0 0 20px;
  color: #65777e;
}

.step-actions {
  display: flex;
  align-items: center;
  margin-top: 24px;
}
</style>