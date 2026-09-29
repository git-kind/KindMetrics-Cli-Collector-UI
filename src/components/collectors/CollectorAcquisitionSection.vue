<template>
  <div class="data-acquisition-admin q-gutter-md">
    <q-banner rounded class="bg-blue-grey-1 text-blue-grey-10">
      <template #avatar>
        <q-icon name="info" color="primary" />
      </template>
      {{ t('collectors.acquisition.mockNotice') }}
    </q-banner>

    <q-splitter v-model="splitterModel" unit="px" style="height: 760px;" class="acquisition-splitter">
      <template #before>
        <div class="acquisition-sidebar">
          <div class="text-subtitle2 text-weight-medium q-mb-md">{{ t('collectors.acquisition.dataListTitle') }}</div>

          <q-input
            v-model="search"
            dense
            outlined
            :placeholder="t('collectors.acquisition.searchData')"
            class="q-mb-md"
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-list bordered class="acquisition-list">
            <q-item
              v-for="item in filteredItems"
              :key="item.id"
              clickable
              :active="selectedItemId === item.id"
              active-class="bg-primary-1"
              @click="selectedItemId = item.id"
            >
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.methodName }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="statusColor(item.status)" text-color="white" :label="statusLabel(item.status)" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-btn
            class="full-width q-mt-md"
            color="primary"
            icon="add"
            :label="t('collectors.acquisition.newData')"
            @click="openCreateDialog"
          />
        </div>
      </template>

      <template #after>
        <div v-if="selectedItem" class="acquisition-detail">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-h5 text-weight-medium">{{ selectedItem.name }}</div>
              <div class="text-caption text-grey-6">{{ selectedItem.description || t('collectors.acquisition.noDescription') }}</div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn flat dense color="primary" icon="edit" :label="t('common.edit')" @click="openEditDialog(selectedItem)" />
              <q-btn flat dense color="negative" icon="delete" :label="t('common.delete')" @click="deleteSelectedItem" />
            </div>
          </div>

          <div class="info-grid q-mb-md">
            <div class="info-card">
              <div class="text-caption text-grey-6">{{ t('collectors.acquisition.status') }}</div>
              <div class="text-subtitle2">{{ statusLabel(selectedItem.status) }}</div>
            </div>
            <div class="info-card">
              <div class="text-caption text-grey-6">{{ t('collectors.acquisition.method') }}</div>
              <div class="text-subtitle2">{{ selectedItem.methodName }}</div>
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <q-btn outline color="primary" :label="t('collectors.acquisition.validateConfiguration')" icon="verified" @click="validateConfiguration" />
            <q-btn outline color="secondary" :label="t('collectors.acquisition.testConnection')" icon="wifi_tethering" @click="runConnectionTest" />
            <q-btn color="secondary" :label="t('collectors.acquisition.testExtraction')" icon="play_arrow" @click="runExtractionTest" />
          </div>

          <q-card flat bordered class="rounded-borders q-mb-md">
            <q-card-section class="text-subtitle2 text-weight-medium">{{ t('collectors.acquisition.configurationTitle') }}</q-card-section>
            <q-separator />
            <q-card-section class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    :model-value="selectedItem.methodType"
                    :options="methodOptions"
                    :label="t('collectors.acquisition.methodTypeLabel')"
                    emit-value
                    map-options
                    @update:model-value="updateSelectedField('methodType', $event as AcquisitionMethodType)"
                  />
                </div>
                <div class="col-12 col-md-8">
                  <q-input
                    :model-value="selectedItem.methodName"
                    :label="t('collectors.acquisition.methodName')"
                    @update:model-value="updateSelectedField('methodName', $event as string)"
                  />
                </div>
              </div>

              <div class="section-block">
                <div class="section-title">{{ t('collectors.acquisition.connection') }}</div>
                <div class="row q-col-gutter-md">
                  <template v-if="selectedItem.methodType === 'API'">
                    <div class="col-12 col-md-6"><q-input :model-value="selectedItem.connection.url ?? ''" :label="t('collectors.acquisition.url')" @update:model-value="updateConnectionField('url', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.port ?? 443" type="number" :label="t('collectors.acquisition.port')" @update:model-value="updateConnectionField('port', Number($event))" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.timeout ?? 30" type="number" :label="t('collectors.acquisition.timeout')" @update:model-value="updateConnectionField('timeout', Number($event))" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.username ?? ''" :label="t('collectors.acquisition.username')" @update:model-value="updateConnectionField('username', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.password ?? ''" type="password" :label="t('collectors.acquisition.password')" @update:model-value="updateConnectionField('password', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.token ?? ''" :label="t('collectors.acquisition.token')" @update:model-value="updateConnectionField('token', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-select :model-value="selectedItem.connection.authentication ?? 'Bearer'" :options="authenticationOptions" :label="t('collectors.acquisition.authentication')" emit-value map-options @update:model-value="updateConnectionField('authentication', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-toggle :model-value="Boolean(selectedItem.connection.tls)" :label="t('collectors.acquisition.tls')" @update:model-value="updateConnectionField('tls', Boolean($event))" /></div>
                  </template>

                  <template v-else-if="selectedItem.methodType === 'SNMP'">
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.host ?? ''" :label="t('collectors.acquisition.host')" @update:model-value="updateConnectionField('host', $event as string)" /></div>
                    <div class="col-12 col-md-2"><q-input :model-value="selectedItem.connection.port ?? 161" type="number" :label="t('collectors.acquisition.port')" @update:model-value="updateConnectionField('port', Number($event))" /></div>
                    <div class="col-12 col-md-3"><q-select :model-value="selectedItem.connection.version ?? 'v2c'" :options="snmpVersions" :label="t('collectors.acquisition.version')" emit-value map-options @update:model-value="updateConnectionField('version', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.community ?? ''" :label="t('collectors.acquisition.community')" @update:model-value="updateConnectionField('community', $event as string)" /></div>
                    <div v-if="selectedItem.connection.version === 'v3'" class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.username ?? ''" :label="t('collectors.acquisition.username')" @update:model-value="updateConnectionField('username', $event as string)" /></div>
                    <div v-if="selectedItem.connection.version === 'v3'" class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.authType ?? ''" :label="t('collectors.acquisition.authentication')" @update:model-value="updateConnectionField('authType', $event as string)" /></div>
                    <div v-if="selectedItem.connection.version === 'v3'" class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.privacy ?? ''" :label="t('collectors.acquisition.privacy')" @update:model-value="updateConnectionField('privacy', $event as string)" /></div>
                  </template>

                  <template v-else-if="selectedItem.methodType === 'WEBHOOK'">
                    <div class="col-12 col-md-6"><q-input :model-value="selectedItem.connection.url ?? ''" :label="t('collectors.acquisition.endpoint')" @update:model-value="updateConnectionField('url', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-select :model-value="selectedItem.connection.method ?? 'POST'" :options="httpMethods" :label="t('collectors.acquisition.httpMethod')" emit-value map-options @update:model-value="updateConnectionField('method', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.connection.timeout ?? 30" type="number" :label="t('collectors.acquisition.timeout')" @update:model-value="updateConnectionField('timeout', Number($event))" /></div>
                    <div class="col-12"><q-input :model-value="(selectedItem.extraction.headers ?? []).join(', ')" :label="t('collectors.acquisition.headers')" @update:model-value="updateExtractionField('headers', ($event as string).split(',').map((entry) => entry.trim()).filter(Boolean))" /></div>
                  </template>

                  <template v-else>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.webhookUrl ?? ''" :label="t('collectors.acquisition.webhookUrl')" @update:model-value="updateConnectionField('webhookUrl', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.tenantId ?? ''" :label="t('collectors.acquisition.tenantId')" @update:model-value="updateConnectionField('tenantId', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.clientId ?? ''" :label="t('collectors.acquisition.clientId')" @update:model-value="updateConnectionField('clientId', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.connection.channel ?? ''" :label="t('collectors.acquisition.channel')" @update:model-value="updateConnectionField('channel', $event as string)" /></div>
                  </template>
                </div>
              </div>

              <div class="section-block">
                <div class="section-title">{{ t('collectors.acquisition.extraction') }}</div>
                <div class="row q-col-gutter-md">
                  <template v-if="selectedItem.methodType === 'API'">
                    <div class="col-12 col-md-3"><q-select :model-value="selectedItem.extraction.httpMethod ?? 'GET'" :options="httpMethods" :label="t('collectors.acquisition.httpMethod')" emit-value map-options @update:model-value="updateExtractionField('httpMethod', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.extraction.endpoint ?? ''" :label="t('collectors.acquisition.endpoint')" @update:model-value="updateExtractionField('endpoint', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="(selectedItem.extraction.parameters ?? []).join(', ')" :label="t('collectors.acquisition.parameters')" @update:model-value="updateExtractionField('parameters', ($event as string).split(',').map((entry) => entry.trim()).filter(Boolean))" /></div>
                    <div class="col-12 col-md-3"><q-select :model-value="selectedItem.extraction.responseFormat ?? 'JSON'" :options="responseFormats" :label="t('collectors.acquisition.format')" emit-value map-options @update:model-value="updateExtractionField('responseFormat', $event as string)" /></div>
                    <div class="col-12 col-md-6"><q-input :model-value="selectedItem.extraction.jsonPath ?? ''" :label="t('collectors.acquisition.dataPath')" @update:model-value="updateExtractionField('jsonPath', $event as string)" /></div>
                    <div class="col-12 col-md-6"><q-input :model-value="(selectedItem.extraction.headers ?? []).join(', ')" :label="t('collectors.acquisition.headers')" @update:model-value="updateExtractionField('headers', ($event as string).split(',').map((entry) => entry.trim()).filter(Boolean))" /></div>
                  </template>

                  <template v-else-if="selectedItem.methodType === 'SNMP'">
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.extraction.oid ?? ''" :label="t('collectors.acquisition.oid')" @update:model-value="updateExtractionField('oid', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-select :model-value="selectedItem.extraction.type ?? 'INTEGER'" :options="snmpTypes" :label="t('collectors.acquisition.dataType')" emit-value map-options @update:model-value="updateExtractionField('type', $event as string)" /></div>
                  </template>

                  <template v-else-if="selectedItem.methodType === 'WEBHOOK'">
                    <div class="col-12 col-md-3"><q-select :model-value="selectedItem.extraction.httpMethod ?? 'POST'" :options="httpMethods" :label="t('collectors.acquisition.httpMethod')" emit-value map-options @update:model-value="updateExtractionField('httpMethod', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.extraction.endpoint ?? ''" :label="t('collectors.acquisition.endpoint')" @update:model-value="updateExtractionField('endpoint', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-select :model-value="selectedItem.extraction.responseFormat ?? 'JSON'" :options="responseFormats" :label="t('collectors.acquisition.format')" emit-value map-options @update:model-value="updateExtractionField('responseFormat', $event as string)" /></div>
                    <div class="col-12 col-md-3"><q-input :model-value="selectedItem.extraction.selector ?? ''" :label="t('collectors.acquisition.dataPath')" @update:model-value="updateExtractionField('selector', $event as string)" /></div>
                  </template>

                  <template v-else>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.extraction.endpoint ?? ''" :label="t('collectors.acquisition.endpoint')" @update:model-value="updateExtractionField('endpoint', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-input :model-value="selectedItem.extraction.selector ?? ''" :label="t('collectors.acquisition.dataPath')" @update:model-value="updateExtractionField('selector', $event as string)" /></div>
                    <div class="col-12 col-md-4"><q-select :model-value="selectedItem.extraction.responseFormat ?? 'JSON'" :options="responseFormats" :label="t('collectors.acquisition.format')" emit-value map-options @update:model-value="updateExtractionField('responseFormat', $event as string)" /></div>
                  </template>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card v-if="validationSummary || testResult" flat bordered class="rounded-borders">
            <q-card-section class="text-subtitle2 text-weight-medium">{{ t('collectors.acquisition.result') }}</q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="validationSummary" class="q-mb-md">
                <div class="text-caption text-grey-6">{{ t('collectors.acquisition.validation') }}</div>
                <div class="text-body2">{{ validationSummary }}</div>
              </div>
              <div v-if="testResult">
                <div class="text-caption text-grey-6">{{ t('collectors.acquisition.result') }}</div>
                <div class="text-subtitle2">{{ testResult.status === 'SUCCESS' ? t('collectors.acquisition.successState') : t('collectors.acquisition.errorState') }}</div>
                <div class="text-body2">{{ testResult.message }}</div>
                <div v-if="testResult.value" class="text-body2">{{ t('collectors.acquisition.valueLabel') }}: {{ testResult.value }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-else class="empty-panel">
          <div class="text-h6">{{ t('collectors.acquisition.noSelection') }}</div>
          <q-btn class="q-mt-md" color="primary" icon="add" :label="t('collectors.acquisition.newData')" @click="openCreateDialog" />
        </div>
      </template>
    </q-splitter>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 420px; max-width: 560px; width: 92vw;">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ dialogMode === 'create' ? t('collectors.acquisition.newData') : t('collectors.acquisition.editData') }}</div>
          <q-btn flat round dense icon="close" v-close-popup @click="dialogOpen = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="formModel.name" :label="t('collectors.acquisition.dataName')" />
          <q-input v-model="formModel.description" type="textarea" :label="t('collectors.acquisition.description')" />
          <q-select v-model="formModel.status" :options="statusOptions" :label="t('collectors.acquisition.status')" emit-value map-options />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" color="primary" @click="dialogOpen = false" />
          <q-btn color="primary" :label="t('common.save')" @click="saveItemFromDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  AcquisitionMethodType,
  Collector,
  CollectorAcquisitionDataItem,
  CollectorConnectionConfig,
  CollectorExtractionConfig,
} from 'src/models/collector';

const props = defineProps<{ collector: Collector }>();
const { t } = useI18n();

const defaultItems: CollectorAcquisitionDataItem[] = [
  {
    id: 'numero-llamadas',
    name: 'NumeroLlamadas',
    description: 'Número total de llamadas.',
    status: 'ACTIVE',
    methodType: 'API',
    methodName: 'API - CDR',
    connection: {
      name: 'API - CDR',
      type: 'API',
      status: 'OK',
      url: 'https://servidor',
      port: 443,
      username: 'collector-user',
      password: '********',
      authentication: 'Bearer',
      timeout: 120,
      tls: true,
    },
    extraction: {
      name: 'Call records extraction',
      method: 'GET',
      httpMethod: 'GET',
      endpoint: '/api/cdr',
      parameters: ['limit=1000'],
      headers: ['Authorization: Bearer token'],
      responseFormat: 'JSON',
      jsonPath: 'data.totalCalls',
    },
    lastTest: '2026-09-29T09:20:00.000Z',
  },
  {
    id: 'calling-number',
    name: 'CallingNumber',
    description: 'Número de origen de la llamada.',
    status: 'ACTIVE',
    methodType: 'API',
    methodName: 'API - CDR',
    connection: {
      name: 'API - CDR',
      type: 'API',
      status: 'OK',
      url: 'https://servidor',
      port: 443,
      username: 'collector-user',
      password: '********',
      authentication: 'Bearer',
      timeout: 120,
      tls: true,
    },
    extraction: {
      name: 'Call records extraction',
      method: 'GET',
      httpMethod: 'GET',
      endpoint: '/api/cdr',
      parameters: ['limit=1000'],
      headers: ['Authorization: Bearer token'],
      responseFormat: 'JSON',
      jsonPath: 'data.callingNumber',
    },
  },
  {
    id: 'cpu',
    name: 'CPU',
    description: 'Uso medio de CPU del equipo.',
    status: 'ACTIVE',
    methodType: 'SNMP',
    methodName: 'SNMP - CPU',
    connection: {
      name: 'SNMP - CPU',
      type: 'SNMP',
      status: 'OK',
      host: '192.168.1.10',
      port: 161,
      version: 'v2c',
      community: 'public',
    },
    extraction: {
      name: 'CPU OID',
      method: 'SNMP',
      oid: '1.3.6.1.4.1.2021.11.9.0',
      type: 'INTEGER',
    },
  },
  {
    id: 'eventos',
    name: 'Eventos',
    description: 'Eventos expuestos por el sistema origen.',
    status: 'WARN',
    methodType: 'WEBHOOK',
    methodName: 'Webhook - Eventos',
    connection: {
      name: 'Webhook - Eventos',
      type: 'WEBHOOK',
      status: 'WARN',
      url: 'https://eventhub.example/webhook',
      method: 'POST',
      timeout: 45,
    },
    extraction: {
      name: 'Eventos payload',
      method: 'WEBHOOK',
      httpMethod: 'POST',
      endpoint: '/webhook/events',
      headers: ['Authorization: Bearer token'],
      responseFormat: 'JSON',
      selector: '$.events[*]',
    },
  },
  {
    id: 'usuarios',
    name: 'Usuarios',
    description: 'Identidad de usuarios del entorno.',
    status: 'INACTIVE',
    methodType: 'MICROSOFT_TEAMS',
    methodName: 'Microsoft Teams',
    connection: {
      name: 'Microsoft Teams',
      type: 'MICROSOFT_TEAMS',
      status: 'WARN',
      webhookUrl: 'https://graph.microsoft.com',
      tenantId: 'tenant-01',
      clientId: 'client-01',
      channel: 'general',
    },
    extraction: {
      name: 'Microsoft Teams payload',
      method: 'MICROSOFT_TEAMS',
      endpoint: '/v1.0/chats',
      responseFormat: 'JSON',
      selector: '$.value[*]',
    },
  },
];

const items = ref<CollectorAcquisitionDataItem[]>([]);
const selectedItemId = ref<string | null>(null);
const search = ref('');
const splitterModel = ref(340);
const dialogOpen = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const validationSummary = ref<string | null>(null);
const testResult = ref<{ status: 'SUCCESS' | 'ERROR'; message: string; value?: string } | null>(null);
const formModel = ref({ name: '', description: '', status: 'ACTIVE' as CollectorAcquisitionDataItem['status'] });

const methodOptions = [
  { label: 'API', value: 'API' },
  { label: 'SNMP', value: 'SNMP' },
  { label: 'Webhook', value: 'WEBHOOK' },
  { label: 'Microsoft Teams', value: 'MICROSOFT_TEAMS' },
] as const;

const statusOptions = [
  { label: t('collectors.acquisition.statusActive'), value: 'ACTIVE' },
  { label: t('collectors.acquisition.statusInactive'), value: 'INACTIVE' },
  { label: t('collectors.acquisition.statusWarn'), value: 'WARN' },
] as const;
const snmpVersions = ['v2c', 'v3'] as const;
const httpMethods = ['GET', 'POST'] as const;
const responseFormats = ['JSON', 'XML', 'TEXT'] as const;
const snmpTypes = ['INTEGER', 'STRING', 'COUNTER', 'OCTETSTRING'] as const;
const authenticationOptions = ['Bearer', 'Basic', 'Token'] as const;

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return items.value;

  return items.value.filter((item) => {
    const haystack = `${item.name} ${item.methodName} ${statusLabel(item.status)}`.toLowerCase();
    return haystack.includes(query);
  });
});

const selectedItem = computed(() => items.value.find((item) => item.id === selectedItemId.value) ?? null);

function statusColor(status: CollectorAcquisitionDataItem['status']): string {
  if (status === 'ACTIVE') return 'positive';
  if (status === 'WARN') return 'warning';
  return 'grey';
}

function statusLabel(status: CollectorAcquisitionDataItem['status']): string {
  const labels: Record<CollectorAcquisitionDataItem['status'], string> = {
    ACTIVE: t('collectors.acquisition.statusConfigured'),
    INACTIVE: t('collectors.acquisition.statusInactive'),
    WARN: t('collectors.acquisition.statusWarn'),
  };
  return labels[status] ?? status;
}

function buildMethodName(type: AcquisitionMethodType): string {
  const names: Record<AcquisitionMethodType, string> = {
    API: 'API - CDR',
    SNMP: 'SNMP - Equipo',
    WEBHOOK: 'Webhook - Eventos',
    MICROSOFT_TEAMS: 'Microsoft Teams',
  };
  return names[type] ?? type;
}

function getConnectionEmpty(type: AcquisitionMethodType): CollectorConnectionConfig {
  const base: CollectorConnectionConfig = {
    name: buildMethodName(type),
    type,
    status: 'WARN',
  };

  if (type === 'API') {
    return { ...base, url: 'https://servidor', port: 443, authentication: 'Bearer', timeout: 30, tls: true };
  }
  if (type === 'SNMP') {
    return { ...base, host: '192.168.1.10', port: 161, version: 'v2c', community: 'public' };
  }
  if (type === 'WEBHOOK') {
    return { ...base, url: 'https://endpoint.example/webhook', method: 'POST', timeout: 30 };
  }
  return { ...base, webhookUrl: 'https://graph.microsoft.com', tenantId: 'tenant-01', clientId: 'client-01', channel: 'general' };
}

function getExtractionEmpty(type: AcquisitionMethodType): CollectorExtractionConfig {
  if (type === 'API') {
    return { name: 'API extraction', method: 'GET', httpMethod: 'GET', endpoint: '/api/data', parameters: ['limit=100'], headers: ['Authorization: Bearer token'], responseFormat: 'JSON', jsonPath: 'data.value' };
  }
  if (type === 'SNMP') {
    return { name: 'SNMP extraction', method: 'SNMP', oid: '1.3.6.1.4.1.0', type: 'INTEGER' };
  }
  if (type === 'WEBHOOK') {
    return { name: 'Webhook extraction', method: 'POST', httpMethod: 'POST', endpoint: '/webhook', responseFormat: 'JSON', selector: '$.data[*]' };
  }
  return { name: 'Microsoft Teams extraction', method: 'MICROSOFT_TEAMS', endpoint: '/v1.0/messages', responseFormat: 'JSON', selector: '$.value[*]' };
}

function loadItems(): void {
  const config = (props.collector.configuration ?? {}) as Record<string, unknown>;
  const configured = Array.isArray(config.acquisitionData)
    ? (config.acquisitionData as CollectorAcquisitionDataItem[])
    : [];

  items.value = configured.length ? configured : defaultItems;
  if (!selectedItemId.value && items.value.length) {
    selectedItemId.value = items.value[0]?.id ?? null;
  }
}

onMounted(() => {
  loadItems();
});

function updateSelectedField<Key extends keyof CollectorAcquisitionDataItem>(field: Key, value: CollectorAcquisitionDataItem[Key]): void {
  const current = selectedItem.value;
  if (!current) return;
  const idx = items.value.findIndex((item) => item.id === current.id);
  if (idx === -1) return;

  const updated = { ...items.value[idx], [field]: value } as CollectorAcquisitionDataItem;
  items.value[idx] = updated;

  if (field === 'methodType') {
    const type = value as AcquisitionMethodType;
    updated.methodName = buildMethodName(type);
    updated.connection = getConnectionEmpty(type);
    updated.extraction = getExtractionEmpty(type);
    items.value[idx] = updated;
  }
}

function updateConnectionField<Key extends keyof CollectorConnectionConfig>(field: Key, value: CollectorConnectionConfig[Key]): void {
  const current = selectedItem.value;
  if (!current) return;
  const idx = items.value.findIndex((item) => item.id === current.id);
  if (idx === -1) return;

  const existing = items.value[idx];
  if (!existing) return;

  const updatedConnection = {
    ...existing.connection,
    [field]: value,
  } as CollectorConnectionConfig;

  items.value[idx] = {
    id: existing.id,
    name: existing.name,
    description: existing.description,
    status: existing.status,
    methodType: existing.methodType,
    methodName: existing.methodName,
    connection: updatedConnection,
    extraction: existing.extraction,
    ...(existing.lastTest ? { lastTest: existing.lastTest } : {}),
    ...(existing.testResult ? { testResult: existing.testResult } : {}),
  };
}

function updateExtractionField<Key extends keyof CollectorExtractionConfig>(field: Key, value: CollectorExtractionConfig[Key]): void {
  const current = selectedItem.value;
  if (!current) return;
  const idx = items.value.findIndex((item) => item.id === current.id);
  if (idx === -1) return;

  const existing = items.value[idx];
  if (!existing) return;

  const updatedExtraction = {
    ...existing.extraction,
    [field]: value,
  } as CollectorExtractionConfig;

  items.value[idx] = {
    id: existing.id,
    name: existing.name,
    description: existing.description,
    status: existing.status,
    methodType: existing.methodType,
    methodName: existing.methodName,
    connection: existing.connection,
    extraction: updatedExtraction,
    ...(existing.lastTest ? { lastTest: existing.lastTest } : {}),
    ...(existing.testResult ? { testResult: existing.testResult } : {}),
  };
}

function openCreateDialog(): void {
  dialogMode.value = 'create';
  formModel.value = { name: '', description: '', status: 'ACTIVE' };
  dialogOpen.value = true;
}

function openEditDialog(item: CollectorAcquisitionDataItem): void {
  dialogMode.value = 'edit';
  formModel.value = { name: item.name, description: item.description, status: item.status };
  selectedItemId.value = item.id;
  dialogOpen.value = true;
}

function saveItemFromDialog(): void {
  const name = formModel.value.name.trim();
  if (!name) return;

  if (dialogMode.value === 'create') {
    const nextData: CollectorAcquisitionDataItem = {
      id: `dato-${Date.now()}`,
      name,
      description: formModel.value.description.trim(),
      status: formModel.value.status,
      methodType: 'API',
      methodName: 'API - CDR',
      connection: getConnectionEmpty('API'),
      extraction: getExtractionEmpty('API'),
    };
    items.value = [nextData, ...items.value];
    selectedItemId.value = nextData.id;
  } else {
    const current = selectedItem.value;
    if (!current) return;
    const idx = items.value.findIndex((item) => item.id === current.id);
    if (idx === -1) return;

    items.value[idx] = {
      id: current.id,
      name,
      description: formModel.value.description.trim(),
      status: formModel.value.status,
      methodType: current.methodType,
      methodName: current.methodName,
      connection: current.connection,
      extraction: current.extraction,
      ...(current.lastTest ? { lastTest: current.lastTest } : {}),
      ...(current.testResult ? { testResult: current.testResult } : {}),
    };
  }

  dialogOpen.value = false;
}

function deleteSelectedItem(): void {
  if (!selectedItem.value) return;
  if (!globalThis.confirm(t('collectors.acquisition.confirmDelete', { name: selectedItem.value.name }))) return;
  items.value = items.value.filter((item) => item.id !== selectedItem.value?.id);
  selectedItemId.value = items.value[0]?.id ?? null;
}

function validateConfiguration(): void {
  const current = selectedItem.value;
  if (!current) return;

  const checks: string[] = [
    `${t('collectors.acquisition.validData')}: ${current.name}`,
    `${t('collectors.acquisition.validMethod')}: ${current.methodName}`,
    `${t('collectors.acquisition.validConnection')}: ${current.connection.type ? t('collectors.acquisition.configuredState') : t('collectors.acquisition.errorState')}`,
  ];

  if (current.methodType === 'API') {
    checks.push(`${t('collectors.acquisition.validExtraction')}: ${current.extraction.endpoint ? t('collectors.acquisition.configuredState') : t('collectors.acquisition.errorState')}`);
  }

  validationSummary.value = checks.join(' · ');
}

function runConnectionTest(): void {
  const current = selectedItem.value;
  if (!current) return;
    testResult.value = {
      status: 'SUCCESS',
      message: `${t('collectors.acquisition.connectionSuccess')} ${current.connection.url ?? current.connection.host ?? 'endpoint'}`,
      value: `${t('collectors.acquisition.responseTime')}: 120 ms`,
    };
}

function runExtractionTest(): void {
  const current = selectedItem.value;
  if (!current) return;
  testResult.value = {
    status: 'SUCCESS',
    message: `${t('collectors.acquisition.extractionSuccess')} ${current.name}`,
    value: `${t('collectors.acquisition.valueLabel')}: ${current.extraction.jsonPath ?? current.extraction.selector ?? 'data.value'} / 1250`,
  };
}
</script>

<style scoped>
.data-acquisition-admin {
  display: grid;
  gap: 16px;
}

.acquisition-splitter {
  min-height: 760px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.01);
}

.acquisition-sidebar {
  height: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.acquisition-list {
  border-radius: 10px;
  overflow: hidden;
}

.acquisition-detail {
  height: 100%;
  padding: 16px;
}

.empty-panel {
  height: 100%;
  padding: 24px;
  display: grid;
  place-items: center;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.info-card {
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
}

.section-block {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--q-primary);
}
</style>

