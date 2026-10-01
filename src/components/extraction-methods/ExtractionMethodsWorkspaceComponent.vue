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
      <q-card flat bordered class="method-list">
        <q-list separator>
          <q-item
            v-for="method in filteredMethods"
            :key="method.id"
            clickable
            :active="selected?.id === method.id"
            active-class="method-selected"
            @click="selectedId = method.id"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ methodTypeLabel(method.type) }} - {{ method.name }}</q-item-label>
              <q-item-label caption>{{ t(`extractionMethods.discoveryStatus.${method.discovery.status.toLowerCase()}`) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row no-wrap">
                <q-btn flat round dense icon="edit" :aria-label="t('common.edit')" @click.stop="openEdit(method)" />
                <q-btn flat round dense color="negative" icon="delete" :aria-label="t('common.delete')" @click.stop="confirmDelete(method)" />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="!loading && filteredMethods.length === 0">
            <q-item-section class="km-muted">{{ t('extractionMethods.empty') }}</q-item-section>
          </q-item>
          <q-item v-if="loading"><q-item-section><q-spinner color="primary" /></q-item-section></q-item>
        </q-list>
      </q-card>

      <q-card v-if="selected" flat bordered class="method-detail">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">{{ methodTypeLabel(selected.type) }} - {{ selected.name }}</div>
            <div class="km-muted">{{ selected.description || t('common.notAvailable') }}</div>
          </div>
          <q-space />
          <q-badge :color="selected.status === 'ACTIVE' ? 'positive' : 'grey-7'" :label="t(`collectors.status.${selected.status.toLowerCase()}`)" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-banner dense rounded class="q-mb-md">{{ t('extractionMethods.mockOnly') }}</q-banner>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.connection') }}</div>
          <q-list dense separator>
            <q-item v-for="[key, value] in Object.entries(selected.connection)" :key="key">
              <q-item-section>{{ connectionFieldLabel(key) }}</q-item-section>
              <q-item-section side>{{ String(value) }}</q-item-section>
            </q-item>
          </q-list>
          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              v-if="selected.type === 'MICROSOFT_GRAPH'"
              outline
              color="primary"
              icon="verified_user"
              :loading="testing"
              :label="t('extractionMethods.actions.testAuthentication')"
              @click="testConnection"
            />
            <q-btn
              v-else
              outline
              color="primary"
              icon="cable"
              :loading="testing"
              :label="t(selected.type === 'WEBHOOK' ? 'extractionMethods.actions.testConfiguration' : 'extractionMethods.actions.testConnection')"
              @click="testConnection"
            />
            <q-btn color="primary" unelevated icon="travel_explore" :loading="discovering" :label="t('extractionMethods.actions.runDiscovery')" @click="runDiscovery" />
            <q-btn v-if="selected.type === 'WEBHOOK'" flat color="secondary" icon="data_object" :label="t('extractionMethods.actions.showPayload')" @click="payloadOpen = true" />
          </div>
          <q-banner v-if="feedbackKey" rounded class="q-mt-md" :class="feedbackSuccess ? 'feedback-success' : 'feedback-error'">
            {{ t(feedbackKey) }}
          </q-banner>
        </q-card-section>

        <template v-if="selected.discovery.device">
          <q-separator />
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.device') }}</div>
            <div class="detail-grid">
              <div v-for="[key, value] in Object.entries(selected.discovery.device)" :key="key">
                <span>{{ connectionFieldLabel(key) }}</span><strong>{{ value }}</strong>
              </div>
            </div>
          </q-card-section>
        </template>

        <template v-if="selected.discovery.resources.length">
          <q-separator />
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.resources') }}</div>
            <div class="row q-gutter-sm">
              <q-chip v-for="resource in selected.discovery.resources" :key="resource" square>{{ resource }}</q-chip>
            </div>
          </q-card-section>
        </template>

        <q-separator />
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.availableData') }}</div>
          <q-list dense separator>
            <q-item v-for="item in selected.availableData" :key="item.id">
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.description }} · {{ methodTypeLabel(item.source as ExtractionMethodType) }}</q-item-label>
              </q-item-section>
              <q-item-section side><q-badge color="positive" :label="t('extractionMethods.dataStatus.available')" /></q-item-section>
            </q-item>
            <q-item v-if="selected.availableData.length === 0"><q-item-section class="km-muted">{{ t('extractionMethods.noDiscoveredData') }}</q-item-section></q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <q-card v-else flat bordered class="method-detail empty-detail row items-center justify-center">
        <div class="km-muted">{{ t('extractionMethods.selectPrompt') }}</div>
      </q-card>
    </div>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="method-form">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t(editing ? 'extractionMethods.actions.edit' : 'extractionMethods.actions.create') }}</div>
          <q-space />
          <q-btn flat round dense icon="close" :aria-label="t('common.cancel')" @click="dialogOpen = false" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="saveMethod">
            <q-select :model-value="draft.type" outlined emit-value map-options :options="typeOptions" option-value="value" option-label="label" :label="t('extractionMethods.fields.type')" :rules="[requiredRule]" @update:model-value="changeMethodType" />
            <q-input v-model.trim="draft.name" outlined :label="t('extractionMethods.fields.name')" :rules="[requiredRule]" />
            <q-input v-model.trim="draft.description" outlined type="textarea" autogrow :label="t('extractionMethods.fields.description')" />
            <div class="text-subtitle2 text-weight-medium">{{ t('extractionMethods.sections.connection') }}</div>
            <q-input
              v-for="field in editConnectionFields"
              :key="field"
              :model-value="String(draft.connection[field] ?? '')"
              outlined
              :type="field === 'community' || field === 'token' ? 'password' : 'text'"
              :label="connectionFieldLabel(field)"
              @update:model-value="updateConnectionField(field, $event)"
            />
            <q-banner v-if="formError" rounded class="feedback-error">{{ t(formError) }}</q-banner>
          </q-form>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="t('common.cancel')" @click="dialogOpen = false" />
          <q-btn color="primary" unelevated :loading="saving" :label="t('common.save')" icon="save" @click="saveMethod" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="payloadOpen">
      <q-card class="method-form">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('extractionMethods.actions.showPayload') }}</div>
          <q-space />
          <q-btn flat round dense icon="close" :aria-label="t('common.cancel')" @click="payloadOpen = false" />
        </q-card-section>
        <q-separator />
        <q-card-section><pre class="payload-example">{{ webhookPayload }}</pre></q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
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
const requiredRule = (value: string) => !!value?.trim() || t('common.required');

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
  try {
    const result = await extractionMethodService.testConnection(selected.value.id);
    feedbackSuccess.value = result.success;
    feedbackKey.value = result.messageKey;
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

.method-list,
.method-detail {
  min-width: 0;
}

.method-selected {
  background: color-mix(in srgb, var(--km-primary) 12%, var(--km-surface));
}

.empty-detail {
  min-height: 320px;
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-grid > div {
  display: grid;
  gap: 4px;
}

.detail-grid span {
  color: var(--km-muted);
  font-size: 12px;
}

.detail-grid strong {
  overflow-wrap: anywhere;
}

.feedback-success {
  background: #e9f5ef;
  color: #17633f;
}

.feedback-error {
  background: #fbefed;
  color: #8e3025;
}

@media (max-width: 800px) {
  .method-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>