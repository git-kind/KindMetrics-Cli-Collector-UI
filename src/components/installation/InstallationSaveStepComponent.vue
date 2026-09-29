<template>
  <div class="step-content">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">
      {{ t('installation.save.title') }}
    </div>
    <p class="step-description">
      {{ t('installation.save.description', { companyId }) }}
    </p>
    <q-banner v-if="saveFailed" rounded class="status-banner q-mb-md">
      <template #avatar><q-icon name="error" color="negative" /></template>
      {{ t('installation.save.error') }}
    </q-banner>
    <div class="step-actions step-actions-split">
      <q-btn flat :label="t('common.back')" icon="arrow_back" @click="emit('back')" />
      <q-btn
        color="primary"
        unelevated
        :loading="saving"
        :label="t('installation.save.action')"
        icon="save"
        :disable="connectionState !== 'success'"
        @click="emit('save')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ConnectionTestState } from 'src/models/installation';

defineProps<{
  companyId: string;
  connectionState: ConnectionTestState;
  saving: boolean;
  saveFailed: boolean;
}>();
const emit = defineEmits<{ (event: 'back'): void; (event: 'save'): void }>();
const { t } = useI18n();
</script>

<style scoped>
.step-content {
  max-width: 650px;
}

.step-description {
  margin: 0 0 20px;
  color: #65777e;
}

.status-banner {
  background: #fbefed;
  color: #8e3025;
}

.step-actions {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.step-actions-split {
  justify-content: space-between;
}
</style>