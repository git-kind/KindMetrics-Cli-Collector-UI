<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-lg">{{ t('pages.origins') }}</div>
    <MockTableComponent :rows="rows" :columns="columns" />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import MockTableComponent from '../components/common/MockTableComponent.vue';
import { originsMock } from '../mocks/collector.mock';

const { t } = useI18n();
const rows = originsMock;
const columns: QTableColumn[] = [
  { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
  { name: 'type', label: t('common.type'), field: 'type', align: 'left' },
  { name: 'equipmentId', label: 'Equipment ID', field: 'equipmentId', align: 'left' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' },
];
</script>
