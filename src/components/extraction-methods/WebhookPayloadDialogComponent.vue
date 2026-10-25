<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="payload-dialog">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ t('extractionMethods.actions.showPayload') }}</div>
        <q-space />
        <q-btn flat round dense icon="close" :aria-label="t('common.cancel')" @click="emit('update:modelValue', false)" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <pre class="payload-example">{{ payload }}</pre>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ modelValue: boolean; payload: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { t } = useI18n();
</script>

<style scoped>
.payload-dialog {
  width: min(640px, calc(100vw - 32px));
  max-width: 640px;
}

.payload-example {
  margin: 0;
  padding: 16px;
  overflow: auto;
  border-radius: 4px;
  background: var(--km-background);
  color: var(--km-text);
}
</style>