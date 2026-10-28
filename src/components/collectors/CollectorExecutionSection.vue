<template>
  <div class="q-gutter-md">
    <q-card
      flat
      bordered
      class="rounded-borders"
    >
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">
          {{ t('collectors.execution.title') }}
        </div>
      </q-card-section>
      <q-separator />
      <q-list
        dense
        separator
      >
        <q-item
          v-for="item in items"
          :key="item.label"
        >
          <q-item-section>
            <q-item-label caption>
              {{ item.label }}
            </q-item-label>
            <q-item-label>{{ item.value }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-actions align="right">
        <q-btn
          color="primary"
          icon="play_arrow"
          :loading="running"
          :label="t('collectors.execution.runNow')"
          @click="runNow"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { Collector } from 'src/models/collector';
import { collectorService } from 'src/services/collector.service';

const props = defineProps<{ collector: Collector }>();
const emit = defineEmits<{ (event: 'executed'): void }>();
const { t } = useI18n();
const $q = useQuasar();
const running = ref(false);

const execution = computed(() => {
  const config = (props.collector.configuration ?? {}) as Record<string, unknown>;
  return {
    mode: props.collector.executionMode ?? 'Scheduled',
    schedule: props.collector.schedule ?? 'Every 5 minutes',
    lastExecutionAt: props.collector.lastExecutionAt ?? t('common.notAvailable'),
    nextExecutionAt: props.collector.nextExecutionAt ?? t('common.notAvailable'),
    result: props.collector.lastExecutionStatus,
    recordsObtained: toDisplayCount(config.recordsObtained),
    recordsStored: toDisplayCount(config.recordsStored),
  };
});

const items = computed(() => [
  { label: t('collectors.execution.mode'), value: execution.value.mode },
  { label: t('collectors.execution.schedule'), value: execution.value.schedule },
  { label: t('collectors.execution.lastExecution'), value: execution.value.lastExecutionAt },
  { label: t('collectors.execution.nextExecution'), value: execution.value.nextExecutionAt },
  { label: t('collectors.execution.result'), value: execution.value.result ? t(`collectors.executionStatus.${execution.value.result.toLowerCase()}`) : t('common.notAvailable') },
  { label: t('collectors.execution.recordsObtained'), value: execution.value.recordsObtained },
  { label: t('collectors.execution.recordsStored'), value: execution.value.recordsStored },
]);

function toDisplayCount(value: unknown): string {
  const count = Number(value);
  return value !== undefined && value !== null && Number.isFinite(count)
    ? String(count)
    : t('common.notAvailable');
}

async function runNow(): Promise<void> {
  running.value = true;
  try {
    await collectorService.executeCollector(props.collector.id);
    emit('executed');
  } catch {
    $q.notify({ type: 'negative', message: t('collectors.errors.operation') });
  } finally {
    running.value = false;
  }
}
</script>
