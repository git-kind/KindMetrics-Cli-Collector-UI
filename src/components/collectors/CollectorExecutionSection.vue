<template>
  <div class="q-gutter-md">
    <q-banner rounded class="bg-blue-grey-1 text-blue-grey-10">
      <template #avatar><q-icon name="info" color="primary" /></template>
      {{ t('collectors.execution.mockNotice') }}
    </q-banner>

    <q-card flat bordered class="rounded-borders">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">{{ t('collectors.execution.title') }}</div>
      </q-card-section>
      <q-separator />
      <q-list dense separator>
        <q-item v-for="item in items" :key="item.label">
          <q-item-section>
            <q-item-label caption>{{ item.label }}</q-item-label>
            <q-item-label>{{ item.value }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-actions align="right">
        <q-btn color="primary" icon="play_arrow" :label="t('collectors.execution.runNow')" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Collector } from 'src/models/collector';

const props = defineProps<{ collector: Collector }>();
const { t } = useI18n();

const execution = computed(() => {
  const config = (props.collector.configuration ?? {}) as Record<string, unknown>;
  return {
    mode: (config.executionMode as string | undefined) ?? 'Scheduled',
    schedule: (config.schedule as string | undefined) ?? 'Every 5 minutes',
    lastExecutionAt: props.collector.lastExecutionAt ?? '2026-09-29T09:20:00.000Z',
    nextExecutionAt: props.collector.nextExecutionAt ?? '2026-09-29T09:25:00.000Z',
    result: (props.collector.lastExecutionStatus as string | undefined) ?? 'SUCCESS',
    recordsObtained: 1250,
    recordsStored: 1250,
  };
});

const items = computed(() => [
  { label: t('collectors.execution.mode'), value: execution.value.mode },
  { label: t('collectors.execution.schedule'), value: execution.value.schedule },
  { label: t('collectors.execution.lastExecution'), value: execution.value.lastExecutionAt },
  { label: t('collectors.execution.nextExecution'), value: execution.value.nextExecutionAt },
  { label: t('collectors.execution.result'), value: t(`collectors.executionStatus.${execution.value.result.toLowerCase()}`) },
  { label: t('collectors.execution.recordsObtained'), value: String(execution.value.recordsObtained) },
  { label: t('collectors.execution.recordsStored'), value: String(execution.value.recordsStored) },
]);
</script>
