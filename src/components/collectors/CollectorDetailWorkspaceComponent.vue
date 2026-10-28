<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        :aria-label="t('collectors.actions.back')"
        :to="{ name: 'collectors' }"
      >
        <q-tooltip>{{ t('collectors.actions.back') }}</q-tooltip>
      </q-btn>
      <div class="q-ml-sm">
        <div class="text-h5 text-weight-bold">
          {{ collector ? collector.name : t('collectors.detail.title') }}
        </div>
        <div
          v-if="collector"
          class="km-muted"
        >
          {{ collector.code }}
        </div>
      </div>
      <q-space />
      <q-badge
        v-if="collector"
        :color="collector.status === 'ACTIVE' ? 'positive' : 'grey-7'"
        :label="t(`collectors.status.${collector.status.toLowerCase()}`)"
      />
    </div>

    <q-banner
      v-if="!can('collector.view')"
      rounded
      class="bg-warning text-dark q-mb-md"
    >
      {{ t('common.accessDenied') }}
    </q-banner>

    <q-banner
      v-else-if="error"
      rounded
      class="bg-negative text-white q-mb-md"
    >
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ t('collectors.errors.detail') }}
      <template #action>
        <q-btn
          flat
          color="white"
          :label="t('common.retry')"
          @click="loadCollector"
        />
      </template>
    </q-banner>

    <div
      v-else-if="loading"
      class="row justify-center q-pa-xl"
    >
      <q-spinner
        color="primary"
        size="42px"
      />
    </div>

    <q-banner
      v-else-if="notFound"
      rounded
      class="bg-grey-2 text-grey-9"
    >
      <template #avatar>
        <q-icon name="search_off" />
      </template>
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
        <q-tab
          name="general"
          icon="info"
          :label="t('collectors.tabs.general')"
        />
        <q-tab
          name="dataStructure"
          icon="storage"
          :label="t('collectors.tabs.dataStructure')"
        />
        <q-tab
          name="mapping"
          icon="transform"
          :label="t('collectors.tabs.mapping')"
        />
        <q-tab
          name="execution"
          icon="play_arrow"
          :label="t('collectors.tabs.execution')"
        />
        <q-tab
          name="health"
          icon="monitor_heart"
          :label="t('collectors.tabs.health')"
        />
        <q-tab
          name="logs"
          icon="receipt_long"
          :label="t('collectors.tabs.logs')"
        />
        <q-tab
          name="synchronization"
          icon="sync"
          :label="t('collectors.tabs.synchronization')"
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="activeTab"
        animated
        class="bg-transparent"
      >
        <q-tab-panel
          name="general"
          class="q-px-none"
        >
          <CollectorGeneralSection
            :collector="collector"
            :service-name="serviceName"
            :equipment-name="referenceName('equipment', collector.equipmentId)"
            :extraction-methods="extractionMethods"
          />
        </q-tab-panel>
        <q-tab-panel
          name="dataStructure"
          class="q-px-none"
        >
          <CollectorDataStructureSection :collector="collector" />
        </q-tab-panel>
        <q-tab-panel
          name="mapping"
          class="q-px-none"
        >
          <CollectorMappingSection
            :collector="collector"
            :extraction-methods="extractionMethods"
          />
        </q-tab-panel>
        <q-tab-panel
          name="execution"
          class="q-px-none"
        >
          <CollectorExecutionSection
            :collector="collector"
            @executed="refreshExecution"
          />
        </q-tab-panel>
        <q-tab-panel
          name="health"
          class="q-px-none"
        >
          <CollectorHealthComponent
            v-if="health"
            :health="health"
          />
          <q-banner
            v-else
            rounded
            class="bg-grey-2 text-grey-9"
          >
            {{ t('common.notAvailable') }}
          </q-banner>
        </q-tab-panel>
        <q-tab-panel
          name="logs"
          class="q-px-none"
        >
          <CollectorLogsSection
            v-if="logs"
            :logs="logs"
          />
        </q-tab-panel>
        <q-tab-panel
          name="synchronization"
          class="q-px-none"
        >
          <CollectorSynchronizationSection
            :collector="collector"
            @synchronized="refreshExecution"
          />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthorization } from 'src/composables/useAuthorization';
import CollectorDataStructureSection from './CollectorDataStructureSection.vue';
import CollectorExecutionSection from './CollectorExecutionSection.vue';
import CollectorGeneralSection from './CollectorGeneralSection.vue';
import CollectorHealthComponent from './CollectorHealthComponent.vue';
import CollectorLogsSection from './CollectorLogsSection.vue';
import CollectorMappingSection from './CollectorMappingSection.vue';
import CollectorSynchronizationSection from './CollectorSynchronizationSection.vue';
import type { Collector, CollectorHealthMock, CollectorLogMock, CollectorReferenceData } from 'src/models/collector';
import type { ExtractionMethod } from 'src/models/extraction-method';
import type { Service } from 'src/models/services/Service';
import { collectorService } from 'src/services/collector.service';
import { extractionMethodService } from 'src/services/extraction-method.service';
import { serviceService } from 'src/services/services/serviceService';

const route = useRoute();
const { t } = useI18n();
const { can } = useAuthorization();
const collector = ref<Collector | null>(null);
const health = ref<CollectorHealthMock | null>(null);
const logs = ref<CollectorLogMock[] | null>(null);
const references = ref<CollectorReferenceData>({ equipment: [], originVersions: [] });
const extractionMethods = ref<ExtractionMethod[]>([]);
const services = ref<Service[]>([]);
const serviceName = ref('');
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
    const [referenceData, collectorLogs, methods, serviceList, collectorHealth] = await Promise.all([
      collectorService.getReferenceData(),
      collectorService.getCollectorLogs(id),
      extractionMethodService.listMethods(),
      serviceService.listServices(),
      collectorService.getCollectorHealth(id),
    ]);
    if (request !== requestSequence) return;
    collector.value = record;
    references.value = referenceData;
    logs.value = collectorLogs;
    extractionMethods.value = methods;
    services.value = serviceList;
    serviceName.value = serviceList.find((service) => service.id === record.serviceId)?.name ?? '';
    health.value = collectorHealth;
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

async function refreshExecution(): Promise<void> {
  const id = String(route.params.id ?? '');
  const [updatedCollector, updatedLogs, updatedHealth] = await Promise.all([
    collectorService.getCollector(id),
    collectorService.getCollectorLogs(id),
    collectorService.getCollectorHealth(id),
  ]);
  if (updatedCollector) collector.value = updatedCollector;
  logs.value = updatedLogs;
  health.value = updatedHealth;
}
</script>

<style scoped>
.collector-detail-tabs {
  border-bottom: 1px solid var(--km-border);
}
</style>