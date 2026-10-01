<template>
  <div class="q-gutter-md">
    <q-card flat bordered class="rounded-borders">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-medium">{{ t('collectors.synchronization.title') }}</div>
        <q-chip :color="sync.enabled ? 'positive' : 'grey-6'" text-color="white" :label="sync.enabled ? t('collectors.synchronization.enabled') : t('collectors.synchronization.notRequired')" />
      </q-card-section>
      <q-separator />
      <q-list dense separator>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.destination') }}</q-item-label>
            <q-item-label>{{ sync.destination || t('common.notAvailable') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.frequency') }}</q-item-label>
            <q-item-label>{{ sync.frequency || t('common.notAvailable') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.lastSync') }}</q-item-label>
            <q-item-label>{{ sync.lastSyncAt || t('common.notAvailable') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.pendingRecords') }}</q-item-label>
            <q-item-label>{{ sync.pendingRecords }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.sentRecords') }}</q-item-label>
            <q-item-label>{{ sync.sentRecords }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.errorRecords') }}</q-item-label>
            <q-item-label>{{ sync.errorRecords }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('collectors.synchronization.result') }}</q-item-label>
            <q-item-label>{{ sync.result }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-actions align="right">
        <q-btn flat color="primary" :loading="syncing" :label="t('collectors.synchronization.testSync')" icon="sync" @click="testSync" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Collector, CollectorSynchronizationState } from 'src/models/collector';
import { collectorService } from 'src/services/collector.service';

const props = defineProps<{ collector: Collector }>();
const emit = defineEmits<{ (event: 'synchronized'): void }>();
const { t } = useI18n();
const syncing = ref(false);

const sync = computed<CollectorSynchronizationState>(() => {
  const config = (props.collector.configuration ?? {}) as Record<string, unknown>;
  const syncState = config.synchronization as Record<string, unknown> | undefined;
  const result = (syncState?.result as CollectorSynchronizationState['result'] | undefined) ?? 'NOT_REQUIRED';

  return {
    enabled: Boolean(syncState?.enabled ?? false),
    destination: (syncState?.destination as string | undefined) ?? null,
    frequency: (syncState?.frequency as string | undefined) ?? null,
    lastSyncAt: (syncState?.lastSyncAt as string | undefined) ?? null,
    pendingRecords: Number(syncState?.pendingRecords ?? 0),
    sentRecords: Number(syncState?.sentRecords ?? 0),
    errorRecords: Number(syncState?.errorRecords ?? 0),
    result,
  };
});

async function testSync(): Promise<void> {
  syncing.value = true;
  try {
    await collectorService.synchronizeCollector(props.collector.id);
    emit('synchronized');
  } finally {
    syncing.value = false;
  }
}
</script>
