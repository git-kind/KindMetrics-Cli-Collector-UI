<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card class="collector-field-dialog">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ field ? t('collectors.dataStructure.fieldEditTitle') : t('collectors.dataStructure.fieldCreateTitle') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="submit">
          <q-input v-model.trim="form.name" outlined :label="t('collectors.dataStructure.fieldName')" :rules="[requiredRule]" />
          <q-select
            v-model="form.type"
            outlined
            :options="fieldTypes"
            emit-value
            map-options
            :label="t('collectors.dataStructure.fieldType')"
          />

          <q-input
            v-if="form.type === 'VARCHAR'"
            v-model.number="form.length"
            type="number"
            outlined
            :label="t('collectors.dataStructure.length')"
            :rules="[varcharRule]"
          />

          <q-input
            v-if="form.type === 'DECIMAL'"
            v-model.number="form.precision"
            type="number"
            outlined
            :label="t('collectors.dataStructure.precision')"
            :rules="[decimalRule]"
          />

          <q-input
            v-if="form.type === 'DECIMAL'"
            v-model.number="form.scale"
            type="number"
            outlined
            :label="t('collectors.dataStructure.scale')"
            :rules="[decimalRule]"
          />

          <q-checkbox v-model="form.nullable" :label="t('collectors.dataStructure.allowNull')" />
          <q-checkbox v-model="form.primaryKey" :label="t('collectors.dataStructure.primaryKey')" />
          <q-checkbox v-model="form.autoIncrement" :label="t('collectors.dataStructure.autoIncrement')" />
          <q-input v-model.trim="form.defaultValue" outlined :label="t('collectors.dataStructure.defaultValue')" />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="t('common.cancel')" @click="close" />
        <q-btn color="primary" :label="t('common.save')" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CollectorField, CollectorFieldType } from 'src/models/collector';

const props = defineProps<{
  modelValue: boolean;
  field: CollectorField | null;
  existingNames: string[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: Omit<CollectorField, 'id'>): void;
}>();

const { t } = useI18n();
const form = reactive<Omit<CollectorField, 'id'>>({
  name: '',
  type: 'VARCHAR',
  length: 50,
  precision: null,
  scale: null,
  nullable: true,
  primaryKey: false,
  autoIncrement: false,
  defaultValue: null,
  description: '',
});

const fieldTypes: CollectorFieldType[] = [
  'BIGINT',
  'INT',
  'DECIMAL',
  'VARCHAR',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'DATETIME',
  'TIMESTAMP',
  'JSON',
];

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.field) {
      Object.assign(form, {
        name: props.field.name,
        type: props.field.type,
        length: props.field.length ?? 50,
        precision: props.field.precision ?? null,
        scale: props.field.scale ?? null,
        nullable: props.field.nullable,
        primaryKey: props.field.primaryKey,
        autoIncrement: props.field.autoIncrement,
        defaultValue: props.field.defaultValue ?? null,
        description: props.field.description ?? '',
      });
    } else {
      Object.assign(form, {
        name: '',
        type: 'VARCHAR',
        length: 50,
        precision: null,
        scale: null,
        nullable: true,
        primaryKey: false,
        autoIncrement: false,
        defaultValue: null,
        description: '',
      });
    }
  },
  { immediate: true },
);

function close(): void {
  emit('update:modelValue', false);
}

function submit(): void {
  const name = form.name.trim();
  if (!name || !form.type) return;
  const duplicate = props.existingNames.some(
    (value) => value.toLowerCase() === name.toLowerCase() && (!props.field || value.toLowerCase() !== props.field.name.toLowerCase()),
  );
  if (duplicate) return;
  emit('save', {
    ...form,
    name,
    length: form.type === 'VARCHAR' ? Number(form.length ?? 0) : null,
    precision: form.type === 'DECIMAL' ? Number(form.precision ?? 0) : null,
    scale: form.type === 'DECIMAL' ? Number(form.scale ?? 0) : null,
    defaultValue: form.defaultValue?.trim() || null,
    description: form.description?.trim() || '',
  });
}

const requiredRule = (value: string) => !!value?.trim() || t('collectors.dataStructure.validation.nameRequired');
const varcharRule = (value: number | null) => {
  if (form.type !== 'VARCHAR') return true;
  return (value && Number(value) > 0) || t('collectors.dataStructure.validation.varcharLength');
};
const decimalRule = (value: number | null) => {
  if (form.type !== 'DECIMAL') return true;
  return (value && Number(value) > 0) || t('collectors.dataStructure.validation.decimalRule');
};
</script>

<style scoped>
.collector-field-dialog {
  width: min(620px, calc(100vw - 32px));
}
</style>
