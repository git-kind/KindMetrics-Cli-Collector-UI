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
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Collector } from 'src/models/collector';

const props = defineProps<{ collector: Collector; equipmentName?: string | null }>();
const { t } = useI18n();

const items = computed(() => [
  { label: t('collectors.fields.code'), value: props.collector.code },
  { label: t('collectors.fields.name'), value: props.collector.name },
  { label: t('collectors.general.team'), value: props.equipmentName || t('common.notAvailable') },
  { label: t('common.status'), value: t(`collectors.status.${props.collector.status.toLowerCase()}`) },
  { label: t('collectors.general.description'), value: props.collector.description || t('common.notAvailable') },
  { label: t('collectors.general.configurationState'), value: t('collectors.dataStructure.statusLabel.defined') },
]);
</script>
