<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-lg">{{ t('pages.equipment') }}</div>
    <MockTableComponent :rows="rows" :columns="columns" />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import MockTableComponent from '../components/common/MockTableComponent.vue';
import { equipmentMock } from '../mocks/collector.mock';

const { t } = useI18n();
const rows = equipmentMock;
const columns: QTableColumn[] = [
  { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
  { name: 'vendor', label: 'Vendor', field: 'vendor', align: 'left' },
  { name: 'model', label: 'Model', field: 'model', align: 'left' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' },
];
</script>
