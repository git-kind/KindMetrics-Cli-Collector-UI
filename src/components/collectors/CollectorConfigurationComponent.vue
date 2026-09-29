<template>
  <section class="q-gutter-md">
    <q-banner rounded class="bg-blue-grey-1 text-blue-grey-10">
      <template #avatar><q-icon name="info" color="primary" /></template>
      {{ t('collectors.configuration.mockNotice') }}
    </q-banner>

    <q-list bordered separator class="rounded-borders">
      <q-item>
        <q-item-section>
          <q-item-label caption>{{ t('collectors.fields.type') }}</q-item-label>
          <q-item-label>{{ collector.type || t('common.notAvailable') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label caption>{{ t('collectors.fields.executionMode') }}</q-item-label>
          <q-item-label>{{ collector.executionMode || t('common.notAvailable') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label caption>{{ t('collectors.fields.schedule') }}</q-item-label>
          <q-item-label>{{ collector.schedule || t('common.notAvailable') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div>
      <div class="text-subtitle2 q-mb-sm">{{ t('collectors.fields.configuration') }}</div>
      <pre v-if="hasConfiguration" class="configuration-json">{{ configurationJson }}</pre>
      <q-banner v-else rounded class="bg-grey-2 text-grey-8">
        {{ t('collectors.empty.configuration') }}
      </q-banner>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Collector } from 'src/models/collector';

const props = defineProps<{ collector: Collector }>();
const { t } = useI18n();
const hasConfiguration = computed(() => Object.keys(props.collector.configuration).length > 0);
const configurationJson = computed(() => JSON.stringify(props.collector.configuration, null, 2));
</script>

<style scoped>
.configuration-json {
  overflow: auto;
  margin: 0;
  padding: 16px;
  border: 1px solid var(--km-border);
  border-radius: 6px;
  background: var(--km-surface);
  color: var(--km-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>