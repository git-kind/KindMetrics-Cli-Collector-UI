<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card class="method-form">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ t(editing ? 'extractionMethods.actions.edit' : 'extractionMethods.actions.create') }}</div>
        <q-space />
        <q-btn flat round dense icon="close" :aria-label="t('common.cancel')" @click="emit('update:modelValue', false)" />
      </q-card-section>
      <q-separator />
      <q-form @submit.prevent="emit('save')">
        <q-card-section class="q-gutter-md">
          <q-select
            :model-value="draft.type"
            outlined
            emit-value
            map-options
            :options="typeOptions"
            option-value="value"
            option-label="label"
            :label="t('extractionMethods.fields.type')"
            :rules="[requiredRule]"
            @update:model-value="emit('update:type', $event)"
          />
          <q-input
            :model-value="draft.name"
            outlined
            :label="t('extractionMethods.fields.name')"
            :rules="[requiredRule]"
            @update:model-value="emit('update:name', String($event ?? ''))"
          />
          <q-input
            :model-value="draft.description"
            outlined
            type="textarea"
            autogrow
            :label="t('extractionMethods.fields.description')"
            @update:model-value="emit('update:description', String($event ?? ''))"
          />
          <div class="text-subtitle2 text-weight-medium">{{ t('extractionMethods.sections.connection') }}</div>
          <q-input
            v-for="field in connectionFields"
            :key="field"
            :model-value="String(draft.connection[field] ?? '')"
            outlined
            :type="field === 'community' || field === 'token' ? 'password' : 'text'"
            :label="connectionFieldLabel(field)"
            @update:model-value="emit('update:connection', field, $event)"
          />
          <q-banner v-if="errorMessage" rounded class="feedback-error">{{ t(errorMessage) }}</q-banner>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="t('common.cancel')" @click="emit('update:modelValue', false)" />
          <q-btn color="primary" unelevated type="submit" :loading="saving" :label="t('common.save')" icon="save" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ExtractionMethodInput, ExtractionMethodType } from 'src/models/extraction-method';

defineProps<{
  modelValue: boolean;
  editing: boolean;
  saving: boolean;
  errorMessage: string;
  draft: ExtractionMethodInput;
  typeOptions: Array<{ value: ExtractionMethodType; label: string }>;
  connectionFields: string[];
  connectionFieldLabel: (field: string) => string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:type': [value: ExtractionMethodType];
  'update:name': [value: string];
  'update:description': [value: string];
  'update:connection': [field: string, value: string | number | null];
  save: [];
}>();

const { t } = useI18n();
const requiredRule = (value: string) => !!value?.trim() || t('common.required');
</script>

<style scoped>
.method-form {
  width: min(640px, calc(100vw - 32px));
  max-width: 640px;
}

.feedback-error {
  background: #fbefed;
  color: #8e3025;
}
</style>