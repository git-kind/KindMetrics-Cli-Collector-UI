<template>
  <div class="row items-center q-col-gutter-sm extraction-filters">
    <div class="col-12 col-md">
      <q-input
        :model-value="modelValue.search"
        outlined
        dense
        clearable
        :placeholder="t('extractionMethods.filters.searchPlaceholder')"
        @update:model-value="update('search', String($event ?? ''))"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="col-12 col-sm-5 col-md-3">
      <q-select
        :model-value="modelValue.protocol"
        outlined
        dense
        emit-value
        map-options
        :options="protocolSelectOptions"
        :label="t('extractionMethods.filters.protocol')"
        @update:model-value="update('protocol', String($event ?? ''))"
      />
    </div>
    <div class="col-12 col-sm-5 col-md-2">
      <q-select
        :model-value="modelValue.status"
        outlined
        dense
        emit-value
        map-options
        :options="statusOptions"
        :label="t('extractionMethods.filters.status')"
        @update:model-value="
          update('status', $event as ExtractionMethodStatusFilter)
        "
      />
    </div>
    <div class="col-auto">
      <q-btn
        flat
        round
        icon="filter_alt_off"
        :aria-label="t('extractionMethods.filters.clear')"
        @click="clearFilters"
      >
        <q-tooltip>{{ t('extractionMethods.filters.clear') }}</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export type ExtractionMethodStatusFilter = '' | 'ACTIVE' | 'INACTIVE';
export interface ExtractionMethodFilters {
  search: string;
  protocol: string;
  status: ExtractionMethodStatusFilter;
}

const props = defineProps<{
  modelValue: ExtractionMethodFilters;
  protocols: string[];
}>();
const emit = defineEmits<{
  'update:modelValue': [value: ExtractionMethodFilters];
}>();
const { t } = useI18n();

const protocolSelectOptions = computed(() => [
  { label: t('extractionMethods.filters.allProtocols'), value: '' },
  ...props.protocols.map((protocol) => ({ label: protocol, value: protocol })),
]);
const statusOptions = computed(() => [
  { label: t('extractionMethods.filters.allStatuses'), value: '' },
  { label: t('common.active'), value: 'ACTIVE' },
  { label: t('common.inactive'), value: 'INACTIVE' },
]);

function update<Key extends keyof ExtractionMethodFilters>(
  key: Key,
  value: ExtractionMethodFilters[Key],
): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}

function clearFilters(): void {
  emit('update:modelValue', { search: '', protocol: '', status: '' });
}
</script>

<style scoped>
.extraction-filters {
  width: 100%;
}
</style>
