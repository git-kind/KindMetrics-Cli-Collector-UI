<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card class="collector-form-dialog">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ t(isEditing ? 'collectors.form.editTitle' : 'collectors.form.createTitle') }}</div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" :aria-label="t('common.cancel')" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-md" @submit.prevent="submit">
          <q-input
            v-model.trim="draft.code"
            outlined
            :label="t('collectors.fields.code')"
            :placeholder="t('collectors.form.codePlaceholder')"
            :rules="[requiredRule]"
            maxlength="80"
          />
          <q-input
            v-model.trim="draft.name"
            outlined
            :label="t('collectors.fields.name')"
            :placeholder="t('collectors.form.namePlaceholder')"
            :rules="[requiredRule]"
            maxlength="160"
          />
          <q-input
            v-model.trim="draft.description"
            outlined
            type="textarea"
            autogrow
            :label="t('collectors.fields.description')"
            :placeholder="t('collectors.form.descriptionPlaceholder')"
          />
          <q-input
            v-model.trim="draft.type"
            outlined
            :label="t('collectors.fields.type')"
            :placeholder="t('collectors.form.typePlaceholder')"
          />
          <q-select
            v-model="draft.equipmentId"
            outlined
            clearable
            emit-value
            map-options
            :options="equipmentOptions"
            option-label="name"
            option-value="id"
            :label="t('collectors.fields.equipment')"
          />
          <q-select
            v-model="draft.originVersionId"
            outlined
            clearable
            emit-value
            map-options
            :options="originVersionOptions"
            option-label="name"
            option-value="id"
            :label="t('collectors.fields.originVersion')"
          />
          <q-input
            v-model.trim="draft.executionMode"
            outlined
            :label="t('collectors.fields.executionMode')"
            :placeholder="t('collectors.form.executionModePlaceholder')"
          />
          <q-input
            v-model.trim="draft.schedule"
            outlined
            :label="t('collectors.fields.schedule')"
            :placeholder="t('collectors.form.schedulePlaceholder')"
          />
          <q-input
            v-model="configurationJson"
            outlined
            type="textarea"
            autogrow
            :label="t('collectors.fields.configuration')"
            :rules="[configurationRule]"
          />
          <q-banner v-if="errorMessage" rounded class="bg-negative text-white">
            {{ errorMessage }}
          </q-banner>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="t('common.cancel')" @click="close" />
        <q-btn
          color="primary"
          unelevated
          :loading="saving"
          :label="t(isEditing ? 'common.save' : 'collectors.actions.create')"
          icon="save"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  Collector,
  CollectorFormValue,
  CollectorReferenceData,
} from 'src/models/collector';

const props = defineProps<{
  modelValue: boolean;
  collector: Collector | null;
  references: CollectorReferenceData;
  saving: boolean;
  errorMessage: string;
}>();
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: CollectorFormValue): void;
}>();

const { t } = useI18n();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const draft = reactive<CollectorFormValue>(emptyForm());
const configurationJson = ref('{}');
const isEditing = computed(() => props.collector !== null);
const equipmentOptions = computed(() => props.references.equipment);
const originVersionOptions = computed(() => props.references.originVersions);
const requiredRule = (value: string) => !!value?.trim() || t('common.required');

watch(
  () => [props.modelValue, props.collector] as const,
  ([isOpen, collector]) => {
    if (!isOpen) return;
    Object.assign(draft, collector ? formValueFromCollector(collector) : emptyForm());
    configurationJson.value = JSON.stringify(draft.configuration, null, 2);
  },
  { immediate: true },
);

function emptyForm(): CollectorFormValue {
  return {
    code: '',
    name: '',
    description: '',
    type: null,
    equipmentId: null,
    originVersionId: null,
    executionMode: null,
    schedule: null,
    configuration: {},
  };
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formValueFromCollector(collector: Collector): CollectorFormValue {
  return {
    code: collector.code,
    name: collector.name,
    description: collector.description,
    type: collector.type,
    equipmentId: collector.equipmentId,
    originVersionId: collector.originVersionId,
    executionMode: collector.executionMode,
    schedule: collector.schedule,
    configuration: cloneJson(collector.configuration),
  };
}

function parseConfiguration(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function configurationRule(value: string): boolean | string {
  return parseConfiguration(value) !== null || t('collectors.validation.configurationJson');
}

function close(): void {
  emit('update:modelValue', false);
}

async function submit(): Promise<void> {
  if (!(await formRef.value?.validate())) return;
  const configuration = parseConfiguration(configurationJson.value);
  if (!configuration) return;
  emit('save', { ...draft, configuration });
}
</script>

<style scoped>
.collector-form-dialog {
  width: min(620px, calc(100vw - 32px));
  max-width: 620px;
}
</style>