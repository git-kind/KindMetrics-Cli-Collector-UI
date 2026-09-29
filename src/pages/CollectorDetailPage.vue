<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" :aria-label="t('collectors.actions.back')" :to="{ name: 'collectors' }">
        <q-tooltip>{{ t('collectors.actions.back') }}</q-tooltip>
      </q-btn>
      <div class="q-ml-sm">
        <div class="text-h5 text-weight-bold">
          {{ collector ? collector.name : t('collectors.detail.title') }}
        </div>
        <div v-if="collector" class="km-muted">{{ collector.code }}</div>
      </div>
      <q-space />
      <q-badge
        v-if="collector"
        :color="collector.status === 'ACTIVE' ? 'positive' : 'grey-7'"
        :label="t(`collectors.status.${collector.status.toLowerCase()}`)"
      />
    </div>

    <q-banner v-if="!can('collector.view')" rounded class="bg-warning text-dark q-mb-md">
      {{ t('common.accessDenied') }}
    </q-banner>

    <q-banner v-else-if="error" rounded class="bg-negative text-white q-mb-md">
      <template #avatar><q-icon name="error" /></template>
      {{ t('collectors.errors.detail') }}
      <template #action>
        <q-btn flat color="white" :label="t('common.retry')" @click="loadCollector" />
      </template>
    </q-banner>

    <div v-else-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="42px" />
    </div>

    <q-banner v-else-if="notFound" rounded class="bg-grey-2 text-grey-9">
      <template #avatar><q-icon name="search_off" /></template>
      {{ t('collectors.errors.notFound') }}
    </q-banner>

    <template v-else-if="collector">
      <q-tabs
        v-model="activeTab"
        align="left"
        inline-label
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="collector-detail-tabs"
      >
        <q-tab name="general" icon="info" :label="t('collectors.tabs.general')" />
        <q-tab name="dataStructure" icon="storage" :label="t('collectors.tabs.dataStructure')" />
        <q-tab name="acquisition" icon="download" :label="t('collectors.tabs.acquisition')" />
        <q-tab name="mapping" icon="transform" :label="t('collectors.tabs.mapping')" />
        <q-tab name="execution" icon="play_arrow" :label="t('collectors.tabs.execution')" />
        <q-tab name="logs" icon="receipt_long" :label="t('collectors.tabs.logs')" />
        <q-tab name="synchronization" icon="sync" :label="t('collectors.tabs.synchronization')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="bg-transparent">
        <q-tab-panel name="general" class="q-px-none">
          <CollectorGeneralSection :collector="collector" :equipment-name="referenceName('equipment', collector.equipmentId)" />
        </q-tab-panel>

        <q-tab-panel name="dataStructure" class="q-px-none">
          <CollectorDataStructureSection :collector="collector" />
        </q-tab-panel>

        <q-tab-panel name="acquisition" class="q-px-none">
          <CollectorAcquisitionSection :collector="collector" />
        </q-tab-panel>

        <q-tab-panel name="mapping" class="q-px-none">
          <CollectorMappingSection :collector="collector" />
        </q-tab-panel>

        <q-tab-panel name="execution" class="q-px-none">
          <CollectorExecutionSection :collector="collector" />
        </q-tab-panel>

        <q-tab-panel name="logs" class="q-px-none">
          <CollectorLogsSection v-if="logs" :logs="logs" />
        </q-tab-panel>

        <q-tab-panel name="synchronization" class="q-px-none">
          <CollectorSynchronizationSection :collector="collector" />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthorization } from 'src/composables/useAuthorization';
import CollectorAcquisitionSection from 'src/components/collectors/CollectorAcquisitionSection.vue';
import CollectorDataStructureSection from 'src/components/collectors/CollectorDataStructureSection.vue';
import CollectorExecutionSection from 'src/components/collectors/CollectorExecutionSection.vue';
import CollectorGeneralSection from 'src/components/collectors/CollectorGeneralSection.vue';
import CollectorLogsSection from 'src/components/collectors/CollectorLogsSection.vue';
import CollectorMappingSection from 'src/components/collectors/CollectorMappingSection.vue';
import CollectorSynchronizationSection from 'src/components/collectors/CollectorSynchronizationSection.vue';
import type { Collector, CollectorLogMock, CollectorReferenceData } from 'src/models/collector';
import { collectorService } from 'src/services/collector.service';

const route = useRoute();
const { t } = useI18n();
const { can } = useAuthorization();
const collector = ref<Collector | null>(null);
const logs = ref<CollectorLogMock[] | null>(null);
const references = ref<CollectorReferenceData>({ equipment: [], originVersions: [] });
const activeTab = ref('general');
const loading = ref(false);
const error = ref(false);
const notFound = ref(false);
let requestSequence = 0;

watch(() => route.params.id, () => void loadCollector(), { immediate: true });

async function loadCollector(): Promise<void> {
  const request = ++requestSequence;
  const id = String(route.params.id ?? '');
  if (!can('collector.view')) {
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = false;
  notFound.value = false;
  collector.value = null;
  try {
    const record = await collectorService.getCollector(id);
    if (request !== requestSequence) return;
    if (!record) {
      notFound.value = true;
      return;
    }
    const [referenceData, collectorLogs] = await Promise.all([
      collectorService.getReferenceData(),
      collectorService.getCollectorLogs(id),
    ]);
    if (request !== requestSequence) return;
    collector.value = record;
    references.value = referenceData;
    logs.value = collectorLogs;
  } catch {
    if (request === requestSequence) error.value = true;
  } finally {
    if (request === requestSequence) loading.value = false;
  }
}

function referenceName(kind: 'equipment' | 'originVersions', id: string | null): string {
  if (!id) return t('common.notAvailable');
  return references.value[kind].find((reference) => reference.id === id)?.name ?? t('common.notAvailable');
}

</script>

<style scoped>
.collector-detail-tabs {
  border-bottom: 1px solid var(--km-border);
}
</style>
