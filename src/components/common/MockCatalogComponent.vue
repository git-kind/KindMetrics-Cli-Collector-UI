<template>
  <div>
    <div class="text-h5 q-mb-lg">{{ t(titleKey) }}</div>
    <MockTableComponent :rows="rows" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import MockTableComponent from './MockTableComponent.vue';
import {
  equipmentMock,
  mappingsMock,
  originsMock,
  storageMock,
} from 'src/mocks/collector.mock';

type CatalogKind = 'equipment' | 'origins' | 'mappings' | 'storage';

const props = defineProps<{ catalog: CatalogKind }>();
const { t } = useI18n();

const titleKey = computed(() => `pages.${props.catalog === 'origins' ? 'origins' : props.catalog}`);
const rows = computed(() => ({
  equipment: equipmentMock,
  origins: originsMock,
  mappings: mappingsMock,
  storage: storageMock,
})[props.catalog]);
const columns = computed<QTableColumn[]>(() => {
  const statusColumn = { name: 'status', label: t('common.status'), field: 'status', align: 'left' as const };
  const definitions: Record<CatalogKind, QTableColumn[]> = {
    equipment: [
      { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
      { name: 'vendor', label: 'Vendor', field: 'vendor', align: 'left' },
      { name: 'model', label: 'Model', field: 'model', align: 'left' },
      statusColumn,
    ],
    origins: [
      { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
      { name: 'type', label: t('common.type'), field: 'type', align: 'left' },
      { name: 'equipmentId', label: 'Equipment ID', field: 'equipmentId', align: 'left' },
      statusColumn,
    ],
    mappings: [
      { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
      { name: 'collector', label: t('menu.collectors'), field: 'collector', align: 'left' },
      { name: 'fields', label: 'Fields', field: 'fields', align: 'right' },
      statusColumn,
    ],
    storage: [
      { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
      { name: 'type', label: t('common.type'), field: 'type', align: 'left' },
      statusColumn,
    ],
  };
  return definitions[props.catalog];
});
</script>