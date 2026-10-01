<template>
  <div class="q-gutter-md">
    <q-banner rounded class="bg-blue-grey-1 text-blue-grey-10">
      <template #avatar><q-icon name="info" color="primary" /></template>
      {{ t('collectors.logs.mockNotice') }}
    </q-banner>

    <q-table
      flat
      bordered
      row-key="id"
      :rows="rows"
      :columns="columns"
      :pagination="{ rowsPerPage: 10 }"
      :no-data-label="t('collectors.empty.logs')"
    >
      <template #body-cell-level="slotProps">
        <q-td :props="slotProps">
          <q-badge :color="levelColor(slotProps.value)" :label="slotProps.value" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { CollectorLogMock } from 'src/models/collector';

const props = defineProps<{ logs: CollectorLogMock[] }>();
const { t } = useI18n();

const rows = computed(() => props.logs.map((log) => ({
  ...log,
  timestamp: new Date(log.timestamp).toLocaleString(),
  executionId: log.executionId ?? t('common.notAvailable'),
  message: t(log.messageKey),
  error: log.errorKey ? t(log.errorKey) : t('common.none'),
})));

const columns = computed<QTableColumn[]>(() => [
  { name: 'timestamp', label: t('collectors.logs.timestamp'), field: 'timestamp', align: 'left' },
  { name: 'level', label: t('collectors.logs.level'), field: 'level', align: 'left' },
  { name: 'message', label: t('collectors.logs.message'), field: 'message', align: 'left' },
  { name: 'executionId', label: t('collectors.logs.execution'), field: 'executionId', align: 'left' },
  { name: 'durationMs', label: t('collectors.logs.duration'), field: 'durationMs', align: 'right' },
  { name: 'recordsProcessed', label: t('collectors.logs.recordsProcessed'), field: 'recordsProcessed', align: 'right' },
  { name: 'error', label: t('collectors.logs.error'), field: 'error', align: 'left' },
]);

function levelColor(level: string): string {
  if (level === 'ERROR') return 'negative';
  if (level === 'WARN') return 'warning';
  return 'positive';
}
</script>
