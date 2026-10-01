<template>
  <q-card flat bordered class="rounded-borders">
    <q-card-section class="q-pb-sm">
      <div class="text-subtitle1 text-weight-medium">{{ t('collectors.general.title') }}</div>
    </q-card-section>
    <q-separator />
    <q-list bordered separator>
      <q-item v-for="item in items" :key="item.label">
        <q-item-section>
          <q-item-label caption>{{ item.label }}</q-item-label>
          <q-item-label>{{ item.value }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label caption>{{ t('collectors.extraction.methods') }}</q-item-label>
          <q-item-label>{{ extractionMethodNames.join(', ') || t('common.notAvailable') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label caption>{{ t('collectors.extraction.selectedData') }}</q-item-label>
          <q-item-label>{{ selectedDataNames.join(', ') || t('common.notAvailable') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Collector } from 'src/models/collector';
import type { ExtractionMethod } from 'src/models/extraction-method';

const props = defineProps<{
  collector: Collector;
  equipmentName?: string | null;
  extractionMethods?: ExtractionMethod[];
}>();
const { t } = useI18n();
const extractionMethodNames = computed(() => (props.extractionMethods ?? [])
  .filter((method) => props.collector.extractionMethodIds.includes(method.id))
  .map((method) => `${t(`extractionMethods.types.${method.type}`)} - ${method.name}`));
const selectedDataNames = computed(() => (props.extractionMethods ?? [])
  .filter((method) => props.collector.extractionMethodIds.includes(method.id))
  .flatMap((method) => method.availableData)
  .filter((item) => props.collector.selectedData.includes(item.id))
  .map((item) => item.name));

const items = computed(() => [
  { label: t('collectors.fields.code'), value: props.collector.code },
  { label: t('collectors.fields.name'), value: props.collector.name },
  { label: t('collectors.general.team'), value: props.equipmentName || t('common.notAvailable') },
  { label: t('common.status'), value: t(`collectors.status.${props.collector.status.toLowerCase()}`) },
  { label: t('collectors.general.description'), value: props.collector.description || t('common.notAvailable') },
  { label: t('collectors.general.configurationState'), value: t('collectors.dataStructure.statusLabel.defined') },
]);
</script>
