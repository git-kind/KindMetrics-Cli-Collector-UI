<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card class="collector-table-dialog">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ table ? t('collectors.dataStructure.tableEditTitle') : t('collectors.dataStructure.tableCreateTitle') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-md" @submit.prevent="submit">
          <q-input
            v-model.trim="form.name"
            outlined
            :label="t('collectors.dataStructure.tableName')"
            :rules="[requiredRule, duplicateRule]"
          />
          <q-input
            v-model.trim="form.description"
            outlined
            type="textarea"
            autogrow
            :label="t('collectors.dataStructure.description')"
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
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  modelValue: boolean;
  table: { id: string; name: string; description: string } | null;
  duplicateNames: string[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: { name: string; description: string }): void;
}>();

const { t } = useI18n();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const form = reactive({ name: '', description: '' });

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    form.name = props.table?.name ?? '';
    form.description = props.table?.description ?? '';
    void formRef.value?.validate();
  },
  { immediate: true },
);

function close(): void {
  emit('update:modelValue', false);
}

function submit(): void {
  if (!form.name.trim()) return;
  emit('save', { name: form.name.trim(), description: form.description.trim() });
}

const requiredRule = (value: string) => !!value?.trim() || t('collectors.dataStructure.validation.nameRequired');
const duplicateRule = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return true;
  const duplicate = props.duplicateNames.some(
    (name) => name.toLowerCase() === normalized.toLowerCase() && (!props.table || name.toLowerCase() !== props.table.name.toLowerCase()),
  );
  return !duplicate || t('collectors.dataStructure.validation.nameDuplicated');
};
</script>

<style scoped>
.collector-table-dialog {
  width: min(560px, calc(100vw - 32px));
}
</style>
