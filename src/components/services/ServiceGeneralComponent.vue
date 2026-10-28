<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-input
        v-model.trim="draft.code"
        :label="t('services.fields.code')"
        outlined
        dense
        maxlength="100"
        :rules="[value => !!value?.trim() || t('common.required')]"
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="draft.name"
        :label="t('services.fields.name')"
        outlined
        dense
        :rules="[val => !!val || t('common.required')]"
      />
    </div>
    <div class="col-12 col-md-6">
      <q-select
        v-model="draft.serviceTypeId"
        :options="serviceTypes"
        :loading="loadingTypes"
        :disable="loadingTypes || !serviceTypes.length"
        :rules="[value => !!value || t('common.required')]"
        emit-value
        map-options
        :label="t('services.fields.type')"
        outlined
        dense
      />
    </div>
    <div class="col-12">
      <q-input
        v-model="draft.description"
        :label="t('services.fields.description')"
        type="textarea"
        outlined
        dense
        autogrow
      />
    </div>
    <div class="col-12 col-md-6">
      <q-toggle
        v-model="draft.enabled"
        :label="draft.enabled ? t('common.enabled') : t('common.disabled')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceFormDraft, ServiceTypeCatalogItem } from 'src/models/services/Service';

const { t } = useI18n();
const props = defineProps<{
  draft: ServiceFormDraft;
  types: ServiceTypeCatalogItem[];
  loadingTypes: boolean;
}>();
const emit = defineEmits<{ 'update:draft': [value: ServiceFormDraft] }>();
const draft = reactive({ ...props.draft });

watch(
  () => props.draft,
  (value) => Object.assign(draft, value),
  { deep: true },
);

watch(
  draft,
  (value) => emit('update:draft', { ...value }),
  { deep: true },
);

const serviceTypes = computed(() => props.types.map((type) => ({
  label: type.name,
  value: type.id,
})));

watch(
  () => draft.serviceTypeId,
  (id) => {
    const selectedType = props.types.find((type) => type.id === id);
    if (selectedType) draft.type = selectedType.code;
  },
  { immediate: true },
);
</script>
