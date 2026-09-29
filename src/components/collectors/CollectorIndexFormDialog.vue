<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card class="collector-index-dialog">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ index ? t('collectors.dataStructure.indexEditTitle') : t('collectors.dataStructure.indexCreateTitle') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="submit">
          <q-input v-model.trim="form.name" outlined :label="t('collectors.dataStructure.indexName')" :rules="[requiredRule]" />
          <q-select
            v-model="form.type"
            outlined
            :options="indexTypes"
            emit-value
            map-options
            :label="t('collectors.dataStructure.indexType')"
          />
          <q-select
            v-model="form.fields"
            outlined
            multiple
            use-chips
            :options="fieldOptions"
            :label="t('collectors.dataStructure.indexFields')"
            :rules="[fieldsRule]"
          />
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
import type { CollectorIndex } from 'src/models/collector';

const props = defineProps<{
  modelValue: boolean;
  index: CollectorIndex | null;
  fieldOptions: string[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: Omit<CollectorIndex, 'id'>): void;
}>();

const { t } = useI18n();
const form = reactive<Omit<CollectorIndex, 'id'>>({
  name: '',
  type: 'INDEX',
  fields: [],
});

const indexTypes = ['INDEX', 'UNIQUE', 'FULLTEXT'];

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.index) {
      Object.assign(form, { name: props.index.name, type: props.index.type, fields: [...props.index.fields] });
    } else {
      Object.assign(form, { name: '', type: 'INDEX', fields: [] });
    }
  },
  { immediate: true },
);

function close(): void {
  emit('update:modelValue', false);
}

function submit(): void {
  const name = form.name.trim();
  if (!name || !form.fields.length) return;
  emit('save', { name, type: form.type, fields: [...form.fields] });
}

const requiredRule = (value: string) => !!value?.trim() || t('collectors.dataStructure.validation.nameRequired');
const fieldsRule = (value: string[]) => (value && value.length > 0) || t('collectors.dataStructure.validation.indexFields');
</script>

<style scoped>
.collector-index-dialog {
  width: min(560px, calc(100vw - 32px));
}
</style>
