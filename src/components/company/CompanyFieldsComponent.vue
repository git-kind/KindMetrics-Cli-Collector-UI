<template>
  <div class="company-fields">
    <q-input
      :model-value="modelValue.name"
      outlined
      autofocus
      :label="t('companyContext.name')"
      :rules="[requiredRule]"
      @update:model-value="updateField('name', String($event ?? ''))"
    />
    <q-input
      :model-value="modelValue.shortName"
      outlined
      :label="t('companyContext.shortName')"
      :rules="[requiredRule]"
      @update:model-value="updateField('shortName', String($event ?? ''))"
    />
    <q-input
      :model-value="modelValue.code"
      outlined
      :label="t('companyContext.code')"
      :rules="[requiredRule]"
      @update:model-value="updateField('code', String($event ?? ''))"
    />
    <q-select
      v-if="includeStatus"
      :model-value="modelValue.status"
      outlined
      emit-value
      map-options
      :options="statusOptions"
      :label="t('common.status')"
      @update:model-value="updateField('status', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { CompanyFormFields, CompanyStatus } from 'src/models/company';

const props = withDefaults(defineProps<{
  modelValue: CompanyFormFields;
  includeStatus?: boolean;
  statusOptions?: Array<{ label: string; value: CompanyStatus }>;
}>(), {
  includeStatus: false,
  statusOptions: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: CompanyFormFields];
}>();

const { t } = useI18n();
const requiredRule = (value: string) => !!value?.trim() || t('common.required');

function updateField<Key extends keyof CompanyFormFields>(key: Key, value: CompanyFormFields[Key]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style scoped>
.company-fields {
  display: contents;
}
</style>