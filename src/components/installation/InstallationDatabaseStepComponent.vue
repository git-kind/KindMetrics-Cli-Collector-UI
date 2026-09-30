<template>
  <q-form ref="formRef" class="step-content" @submit.prevent="continueToConnection">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">
      {{ t('installation.database.title') }}
    </div>
    <p class="step-description">{{ t('installation.database.description') }}</p>
    <q-input
      :model-value="database.databaseName"
      outlined
      :readonly="readonly"
      :label="t('installation.database.databaseName')"
      :rules="[requiredRule]"
      @update:model-value="updateField('databaseName', String($event ?? ''))"
    />
    <div class="step-actions step-actions-split">
      <q-btn flat :label="t('common.back')" icon="arrow_back" @click="emit('back')" />
      <q-btn
        color="primary"
        unelevated
        :label="t('common.continue')"
        icon-right="arrow_forward"
        @click="continueToConnection"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DatabaseConfiguration } from 'src/models/installation';

const props = withDefaults(defineProps<{ database: DatabaseConfiguration; readonly?: boolean }>(), {
  readonly: false,
});
const emit = defineEmits<{
  (event: 'update:database', value: DatabaseConfiguration): void;
  (event: 'back'): void;
  (event: 'continue'): void;
}>();

const { t } = useI18n();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const requiredRule = (value: string | number) => !!String(value).trim() || t('common.required');

function updateField<Key extends keyof DatabaseConfiguration>(
  key: Key,
  value: DatabaseConfiguration[Key],
): void {
  emit('update:database', { ...props.database, [key]: value });
}

async function continueToConnection(): Promise<void> {
  if (await formRef.value?.validate()) emit('continue');
}
</script>

<style scoped>
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

.step-actions-split {
  justify-content: space-between;
}

@media (max-width: 600px) {
  .step-actions-split {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>