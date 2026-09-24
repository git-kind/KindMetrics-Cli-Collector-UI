<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">{{ t('dashboard.title') }}</div>
        <div class="km-muted">{{ t('dashboard.subtitle') }}</div>
      </div>
      <q-space />
      <q-badge color="primary" :label="t('dashboard.sample')" />
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="card in cards" :key="card.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat class="km-card q-pa-md">
          <div class="row items-center">
            <q-icon :name="card.icon" size="28px" class="q-mr-md" />
            <div>
              <div class="text-caption km-muted">{{ t(card.label) }}</div>
              <div class="text-h5 text-weight-bold">{{ card.value }}</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <q-card flat class="km-card q-pa-lg q-mt-lg">
      <div class="text-h6 q-mb-md">{{ t('dashboard.flow') }}</div>
      <div class="row items-center q-col-gutter-sm">
        <template v-for="(step, index) in flow" :key="step">
          <div class="col-12 col-sm-auto">
            <q-chip square color="primary" text-color="white" icon="check_circle">
              {{ step }}
            </q-chip>
          </div>
          <div v-if="index < flow.length - 1" class="col-auto gt-xs">
            <q-icon name="arrow_forward" class="km-muted" />
          </div>
        </template>
      </div>
    </q-card>

    <q-card flat class="km-card q-pa-lg q-mt-lg">
      <div class="text-h6">{{ t('dashboard.collectors') }}</div>
      <div class="q-mt-md">
        <q-list separator>
          <q-item v-for="collector in collectors" :key="collector.id">
            <q-item-section avatar>
              <q-icon name="sync_alt" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ collector.name }}</q-item-label>
              <q-item-label caption>{{ collector.equipment }} · {{ collector.origin }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="collector.status === 'online' ? 'positive' : 'grey-7'" :label="collector.status" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { collectorsMock } from '../mocks/collector.mock';

const { t } = useI18n();
const collectors = collectorsMock;
const cards = [
  { label: 'dashboard.equipment', value: 3, icon: 'dns' },
  { label: 'dashboard.origins', value: 3, icon: 'source' },
  { label: 'dashboard.activeCollectors', value: 2, icon: 'sync_alt' },
  { label: 'dashboard.mappings', value: 2, icon: 'account_tree' },
];
const flow = ['Equipment', 'Origin', 'Extraction Method', 'Collector', 'Mapping', 'Storage'];
</script>
