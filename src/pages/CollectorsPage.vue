<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-lg">{{ t('pages.collectors') }}</div>
    <MockTableComponent :rows="rows" :columns="columns" />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import MockTableComponent from '../components/common/MockTableComponent.vue';
import { collectorsMock } from '../mocks/collector.mock';

const { t } = useI18n();
const rows = collectorsMock;
const columns: QTableColumn[] = [
  { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
  { name: 'equipment', label: t('dashboard.equipment'), field: 'equipment', align: 'left' },
  { name: 'origin', label: t('dashboard.origins'), field: 'origin', align: 'left' },
  { name: 'method', label: t('common.type'), field: 'method', align: 'left' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' },
];
</script>
