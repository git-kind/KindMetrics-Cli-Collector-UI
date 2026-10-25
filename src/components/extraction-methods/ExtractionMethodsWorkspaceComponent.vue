<template>
  <div class="extraction-workspace">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">{{ t('extractionMethods.title') }}</div>
      <q-btn color="primary" unelevated icon="add" :label="t('extractionMethods.actions.create')" @click="openCreate" />
    </div>

    <q-input v-model="search" outlined dense clearable :placeholder="t('common.search')" class="q-mb-md search-input">
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <q-banner v-if="pageError" rounded class="bg-negative text-white q-mb-md">
      {{ t('extractionMethods.errors.load') }}
      <template #action><q-btn flat color="white" :label="t('common.retry')" @click="loadMethods" /></template>
    </q-banner>

    <div class="method-layout">
      <ExtractionMethodListComponent
        :methods="filteredMethods"
        :selected-id="selectedId"
        :loading="loading"
        :method-type-label="methodTypeLabel"
        @select="selectedId = $event"
        @edit="openEdit"
        @delete="confirmDelete"
      />
      <ExtractionMethodDetailComponent
        :method="selected"
        :testing="testing"
        :discovering="discovering"
        :feedback-key="feedbackKey"
        :feedback-success="feedbackSuccess"
        :method-type-label="methodTypeLabel"
        :connection-field-label="connectionFieldLabel"
        @test="testConnection"
        @discover="runDiscovery"
        @show-payload="payloadOpen = true"
      />
    </div>

    <ExtractionMethodFormDialogComponent
      v-model="dialogOpen"
      :editing="editing"
      :saving="saving"
      :error-message="formError"
      :draft="draft"
      :type-options="typeOptions"
      :connection-fields="editConnectionFields"
      :connection-field-label="connectionFieldLabel"
      @update:type="changeMethodType"
      @update:name="draft.name = $event"
      @update:description="draft.description = $event"
      @update:connection="updateConnectionField"
      @save="saveMethod"
    />

    <WebhookPayloadDialogComponent v-model="payloadOpen" :payload="webhookPayload" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import ExtractionMethodDetailComponent from './ExtractionMethodDetailComponent.vue';
import ExtractionMethodFormDialogComponent from './ExtractionMethodFormDialogComponent.vue';
import ExtractionMethodListComponent from './ExtractionMethodListComponent.vue';
import WebhookPayloadDialogComponent from './WebhookPayloadDialogComponent.vue';
import type { ExtractionMethod, ExtractionMethodInput, ExtractionMethodType } from '../../models/extraction-method';
import { extractionMethodService } from '../../services/extraction-method.service';
import { collectorService } from '../../services/collector.service';

const { t } = useI18n();
const $q = useQuasar();
const methods = ref<ExtractionMethod[]>([]);
const selectedId = ref('');
const search = ref('');
const loading = ref(false);
const pageError = ref(false);
const testing = ref(false);
const discovering = ref(false);
const saving = ref(false);
const dialogOpen = ref(false);
const payloadOpen = ref(false);
const editing = ref(false);
const formError = ref('');
const feedbackKey = ref('');
const feedbackSuccess = ref(true);
const draft = reactive<ExtractionMethodInput>({ name: '', type: 'SNMP', description: '', connection: {} });
const webhookPayload = JSON.stringify({ eventId: 'event-001', eventType: 'call.completed', timestamp: '2026-09-30T12:00:00Z', data: {} }, null, 2);
const typeOptions = computed(() => extractionMethodService.getTypeOptions().map((value) => ({ value, label: methodTypeLabel(value) })));
const editConnectionFields = computed(() => {
  const fields: Record<ExtractionMethodType, string[]> = {
    SNMP: ['host', 'port', 'version', 'community', 'username', 'authentication', 'privacy'],
    API: ['url', 'port', 'authentication', 'token', 'headers', 'timeout'],
    MICROSOFT_GRAPH: ['tenantId', 'clientId', 'authentication', 'scopes'],
    WEBHOOK: ['endpoint', 'method', 'headers', 'contentType', 'payloadFormat'],
  };
  if (draft.type === 'SNMP' && draft.connection.version !== 'v3') {
    return fields.SNMP.filter((field) => !['username', 'authentication', 'privacy'].includes(field));
  }
  return fields[draft.type];
});
const filteredMethods = computed(() => methods.value.filter((method) => `${method.name} ${method.type}`.toLowerCase().includes(search.value.trim().toLowerCase())));
const selected = computed(() => methods.value.find((method) => method.id === selectedId.value) ?? null);

onMounted(() => void loadMethods());

async function loadMethods(): Promise<void> {
  loading.value = true;
  pageError.value = false;
  try {
    methods.value = await extractionMethodService.listMethods();
    if (!methods.value.some((method) => method.id === selectedId.value)) selectedId.value = methods.value[0]?.id ?? '';
  } catch {
    pageError.value = true;
  } finally {
    loading.value = false;
  }
}

function methodTypeLabel(type: ExtractionMethodType): string {
  return t(`extractionMethods.types.${type}`);
}

function connectionFieldLabel(key: string): string {
  const supportedKeys = ['host', 'port', 'version', 'community', 'username', 'authentication', 'privacy', 'url', 'token', 'timeout', 'tenantId', 'clientId', 'scopes', 'endpoint', 'method', 'headers', 'contentType', 'payloadFormat', 'name', 'manufacturer', 'model', 'operatingSystem', 'sysObjectID', 'sysDescr'];
  return supportedKeys.includes(key) ? t(`extractionMethods.connectionFields.${key}`) : key;
}

function openCreate(): void {
  editing.value = false;
  formError.value = '';
  Object.assign(draft, { name: '', type: 'SNMP', description: '', connection: defaultConnection('SNMP') });
  dialogOpen.value = true;
}

function defaultConnection(type: ExtractionMethodType): ExtractionMethodInput['connection'] {
  const defaults: Record<ExtractionMethodType, ExtractionMethodInput['connection']> = {
    SNMP: { host: '', port: 161, version: 'v2c', community: '' },
    API: { url: '', port: 443, authentication: 'Bearer', token: '', headers: '', timeout: 30 },
    MICROSOFT_GRAPH: { tenantId: '', clientId: '', authentication: 'Client credentials', scopes: '' },
    WEBHOOK: { endpoint: '', method: 'POST', headers: 'Content-Type: application/json', contentType: 'application/json', payloadFormat: 'JSON' },
  };
  return { ...defaults[type] };
}

function changeMethodType(value: ExtractionMethodType): void {
  draft.type = value;
  draft.connection = defaultConnection(value);
}

function updateConnectionField(field: string, value: string | number | null): void {
  draft.connection[field] = field === 'port' || field === 'timeout' ? Number(value) : String(value ?? '');
}

function openEdit(method: ExtractionMethod): void {
  editing.value = true;
  formError.value = '';
  Object.assign(draft, { name: method.name, type: method.type, description: method.description, connection: { ...method.connection } });
  selectedId.value = method.id;
  dialogOpen.value = true;
}

async function saveMethod(): Promise<void> {
  formError.value = '';
  saving.value = true;
  try {
    const input = { ...draft, connection: { ...draft.connection } };
    const result = editing.value && selected.value
      ? await extractionMethodService.updateMethod(selected.value.id, input)
      : await extractionMethodService.createMethod(input);
    if (!result.success) {
      formError.value = result.reason === 'duplicate' ? 'extractionMethods.validation.duplicate' : 'extractionMethods.validation.required';
      return;
    }
    dialogOpen.value = false;
    await loadMethods();
    selectedId.value = result.method.id;
  } catch {
    formError.value = 'extractionMethods.errors.save';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(method: ExtractionMethod): Promise<void> {
  let inUse = false;
  try {
    const collectors = await collectorService.listCollectors({ search: '', status: 'ALL' });
    inUse = collectors.some((collector) => collector.extractionMethodIds?.includes(method.id) ?? false);
  } catch {
    inUse = false;
  }
  $q.dialog({
    title: t('extractionMethods.confirm.deleteTitle'),
    message: t(inUse ? 'extractionMethods.confirm.deleteInUse' : 'extractionMethods.confirm.deleteMessage', { name: method.name }),
    cancel: { label: t('common.cancel'), flat: true },
    ok: { label: t('common.delete'), color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const deleted = await extractionMethodService.deleteMethod(method.id);
    if (!deleted) return;
    if (selectedId.value === method.id) selectedId.value = '';
    await loadMethods();
  });
}

async function testConnection(): Promise<void> {
  if (!selected.value) return;
  testing.value = true;
  feedbackKey.value = '';
  try {
    const result = await extractionMethodService.testConnection(selected.value.id);
    feedbackSuccess.value = result.success;
    feedbackKey.value = result.messageKey;
  } catch {
    feedbackSuccess.value = false;
    feedbackKey.value = 'extractionMethods.messages.connectionError';
  } finally {
    testing.value = false;
  }
}

async function runDiscovery(): Promise<void> {
  if (!selected.value) return;
  discovering.value = true;
  feedbackKey.value = '';
  try {
    const method = await extractionMethodService.runDiscovery(selected.value.id);
    if (method) {
      methods.value = methods.value.map((item) => item.id === method.id ? method : item);
      feedbackSuccess.value = true;
      feedbackKey.value = 'extractionMethods.messages.discoverySuccess';
    }
  } catch {
    feedbackSuccess.value = false;
    feedbackKey.value = 'extractionMethods.errors.discovery';
  } finally {
    discovering.value = false;
  }
}
</script>

<style scoped>
.search-input {
  max-width: 480px;
}

.method-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.4fr);
  gap: 16px;
  align-items: start;
}

.method-form {
  width: min(640px, calc(100vw - 32px));
  max-width: 640px;
}

.payload-example {
  margin: 0;
  padding: 16px;
  overflow: auto;
  border-radius: 4px;
  background: var(--km-background);
  color: var(--km-text);
}

@media (max-width: 800px) {
  .method-layout {
    grid-template-columns: 1fr;
  }
}

</style>