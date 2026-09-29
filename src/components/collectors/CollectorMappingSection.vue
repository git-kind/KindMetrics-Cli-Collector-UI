<template>
  <div class="q-gutter-md">
    <q-card flat bordered class="rounded-borders">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-medium">{{ t('collectors.mapping.title') }}</div>
        <q-btn flat color="primary" icon="add" :label="t('collectors.mapping.addRule')" />
      </q-card-section>
      <q-table
        flat
        bordered
        row-key="logicalField"
        :rows="rules"
        :columns="columns"
        :pagination="{ rowsPerPage: 10 }"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { Collector, CollectorMappingRule } from 'src/models/collector';

const props = defineProps<{ collector: Collector }>();
const { t } = useI18n();

const defaultRules: CollectorMappingRule[] = [
  {
    logicalField: 'NumeroLlamadas',
    description: 'Número total de llamadas',
    sourceMethod: 'API - CDR',
    sourceField: 'totalCalls',
    transformation: { name: 'NONE', description: 'Sin transformación' },
    targetTable: 'calls',
    targetField: 'total_calls',
  },
  {
    logicalField: 'callingNumber',
    description: 'Número origen de la llamada',
    sourceMethod: 'API - CDR',
    sourceField: 'callingNumber',
    transformation: { name: 'NONE', description: 'Sin transformación' },
    targetTable: 'calls',
    targetField: 'calling_number',
  },
];

const rules = computed<CollectorMappingRule[]>(() => {
  const config = (props.collector.configuration ?? {}) as Record<string, unknown>;
  return Array.isArray(config.mappings)
    ? (config.mappings as CollectorMappingRule[])
    : defaultRules;
});

const columns = computed<QTableColumn[]>(() => [
  { name: 'logicalField', label: t('collectors.mapping.logicalField'), field: 'logicalField', align: 'left' },
  { name: 'sourceField', label: t('collectors.mapping.sourceField'), field: 'sourceField', align: 'left' },
  { name: 'transformation', label: t('collectors.mapping.transformation'), field: 'transformation', align: 'left' },
  { name: 'targetTable', label: t('collectors.mapping.targetTable'), field: 'targetTable', align: 'left' },
  { name: 'targetField', label: t('collectors.mapping.targetField'), field: 'targetField', align: 'left' },
]);
</script>
