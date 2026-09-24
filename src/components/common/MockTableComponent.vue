<template>
  <q-card flat class="km-card">
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="statusColor(props.value)" :label="statusLabel(props.value)" />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';

interface Props {
  rows: readonly Record<string, unknown>[];
  columns: QTableColumn[];
}

defineProps<Props>();

const { t } = useI18n();

function statusColor(value: unknown) {
  return value === 'active' || value === 'online' ? 'positive' : 'grey-7';
}

function statusLabel(value: unknown) {
  if (value === 'online') return t('common.online');
  if (value === 'offline') return t('common.offline');
  if (value === 'active') return t('common.active');
  return t('common.inactive');
}
</script>
