<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-lg">{{ t('pages.mappings') }}</div>
    <MockTableComponent :rows="rows" :columns="columns" />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import MockTableComponent from '../components/common/MockTableComponent.vue';
import { mappingsMock } from '../mocks/collector.mock';

const { t } = useI18n();
const rows = mappingsMock;
const columns: QTableColumn[] = [
  { name: 'name', label: t('common.name'), field: 'name', align: 'left' },
  { name: 'collector', label: t('menu.collectors'), field: 'collector', align: 'left' },
  { name: 'fields', label: 'Fields', field: 'fields', align: 'right' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' },
];
</script>
