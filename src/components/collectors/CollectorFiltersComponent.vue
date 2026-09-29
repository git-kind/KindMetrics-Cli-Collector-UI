<template>
  <div class="collector-filters row q-col-gutter-md items-center">
    <div class="col-12 col-md-8">
      <q-input
        :model-value="modelValue.search"
        outlined
        dense
        clearable
        :label="t('collectors.filters.search')"
        :placeholder="t('collectors.filters.searchPlaceholder')"
        @update:model-value="updateFilter('search', String($event ?? ''))"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>
    </div>
    <div class="col-12 col-md-4">
      <q-select
        :model-value="modelValue.status"
        outlined
        dense
        emit-value
        map-options
        :options="statusOptions"
        :label="t('collectors.filters.status')"
        @update:model-value="updateFilter('status', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CollectorFilters } from 'src/models/collector';

const props = defineProps<{ modelValue: CollectorFilters }>();
const emit = defineEmits<{ (event: 'update:modelValue', value: CollectorFilters): void }>();
const { t } = useI18n();
const statusOptions = computed(() => [
  { label: t('collectors.filters.allStatuses'), value: 'ALL' },
  { label: t('common.active'), value: 'ACTIVE' },
  { label: t('common.inactive'), value: 'INACTIVE' },
]);

function updateFilter<Key extends keyof CollectorFilters>(
  key: Key,
  value: CollectorFilters[Key],
): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>