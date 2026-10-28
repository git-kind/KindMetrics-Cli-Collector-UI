<template>
  <q-card
    flat
    bordered
  >
    <q-card-section class="row q-col-gutter-md items-end">
      <div class="col-12 col-md-5">
        <q-input
          v-model="model.search"
          :label="t('common.search')"
          clearable
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="model.type"
          :options="typeOptions"
          emit-value
          map-options
          clearable
          :label="t('common.type')"
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="model.status"
          :options="statusOptions"
          emit-value
          map-options
          clearable
          :label="t('common.status')"
          outlined
          dense
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceFilters, ServiceStatus, ServiceType } from 'src/models/services/Service';

const { t } = useI18n();
const model = defineModel<ServiceFilters>({ default: () => ({ search: '', type: '', status: '' }) });

const typeOptions = computed(() => [
  { label: t('services.types.all'), value: '' },
  { label: 'REST API', value: 'REST_API' },
  { label: 'SNMP', value: 'SNMP' },
  { label: 'Webhook', value: 'WEBHOOK' },
  { label: 'Microsoft Teams', value: 'MICROSOFT_TEAMS' },
  { label: 'Microsoft Outlook', value: 'MICROSOFT_OUTLOOK' },
  { label: 'Webex', value: 'WEBEX' },
  { label: 'Zoom', value: 'ZOOM' },
] as Array<{ label: string; value: ServiceType | '' }>);

const statusOptions = computed(() => [
  { label: t('services.status.all'), value: '' },
  { label: t('common.active'), value: 'ACTIVE' as ServiceStatus },
  { label: t('common.inactive'), value: 'INACTIVE' as ServiceStatus },
]);
</script>
