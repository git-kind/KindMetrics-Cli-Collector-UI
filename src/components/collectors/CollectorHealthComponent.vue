<template>
  <div class="q-gutter-md">
    <q-banner rounded class="bg-blue-grey-1 text-blue-grey-10">
      <template #avatar><q-icon name="info" color="primary" /></template>
      {{ t('collectors.health.mockNotice') }}
    </q-banner>
    <q-list bordered separator class="rounded-borders">
      <q-item v-for="item in healthItems" :key="item.label">
        <q-item-section>
          <q-item-label caption>{{ t(item.label) }}</q-item-label>
          <q-item-label>{{ item.value }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label caption>{{ t('collectors.health.lastError') }}</q-item-label>
          <q-item-label>{{ health.lastErrorKey ? t(health.lastErrorKey) : t('common.none') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CollectorHealthMock } from 'src/models/collector';

const props = defineProps<{ health: CollectorHealthMock }>();
const { t, locale } = useI18n();

function formatDate(value: string | null): string {
  if (!value) return t('common.notAvailable');
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

const healthItems = computed(() => [
  { label: 'collectors.health.status', value: t(`collectors.executionStatus.${props.health.status.toLowerCase()}`) },
  { label: 'collectors.health.lastExecution', value: formatDate(props.health.lastExecutionAt) },
  {
    label: 'collectors.health.lastSuccessfulExecution',
    value: formatDate(props.health.lastSuccessfulExecutionAt),
  },
  {
    label: 'collectors.health.duration',
    value: props.health.durationMs === null
      ? t('common.notAvailable')
      : t('collectors.units.milliseconds', { count: props.health.durationMs }),
  },
  { label: 'collectors.health.recordsProcessed', value: String(props.health.recordsProcessed) },
  { label: 'collectors.health.errors', value: String(props.health.errors) },
]);
</script>