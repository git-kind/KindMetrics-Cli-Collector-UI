<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-col-gutter-md q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">{{ t('collectors.title') }}</div>
        <div class="km-muted">{{ t('collectors.subtitle') }}</div>
      </div>
      <div v-if="can('collector.create')" class="col-auto">
        <q-btn
          color="primary"
          unelevated
          icon="add"
          :label="t('collectors.actions.new')"
          :disable="referencesLoading"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <q-banner v-if="pageError" rounded class="bg-negative text-white q-mb-md">
      <template #avatar><q-icon name="error" /></template>
      {{ t(pageErrorMessage) }}
      <template #action>
        <q-btn flat color="white" :label="t('common.retry')" @click="loadPage" />
      </template>
    </q-banner>

    <q-banner v-if="!can('collector.view')" rounded class="bg-warning text-dark q-mb-md">
      {{ t('common.accessDenied') }}
    </q-banner>

    <CollectorFiltersComponent v-if="can('collector.view')" v-model="filters" class="q-mb-md" />

    <q-table
      v-if="can('collector.view')"
      flat
      bordered
      row-key="id"
      :rows="collectors"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      :no-data-label="t('collectors.empty.filtered')"
    >
      <template #body-cell-equipmentId="slotProps">
        <q-td :props="slotProps">{{ referenceName('equipment', slotProps.value) }}</q-td>
      </template>
      <template #body-cell-originVersionId="slotProps">
        <q-td :props="slotProps">{{ referenceName('originVersions', slotProps.value) }}</q-td>
      </template>
      <template #body-cell-status="slotProps">
        <q-td :props="slotProps">
          <q-badge
            :color="slotProps.value === 'ACTIVE' ? 'positive' : 'grey-7'"
            :label="t(`collectors.status.${String(slotProps.value).toLowerCase()}`)"
          />
        </q-td>
      </template>
      <template #body-cell-lastExecutionStatus="slotProps">
        <q-td :props="slotProps">
          <q-badge
            v-if="slotProps.value"
            :color="executionStatusColor(slotProps.value)"
            :label="t(`collectors.executionStatus.${String(slotProps.value).toLowerCase()}`)"
          />
          <span v-else class="km-muted">{{ t('common.notAvailable') }}</span>
        </q-td>
      </template>
      <template #body-cell-actions="slotProps">
        <q-td :props="slotProps" class="text-right">
          <q-btn v-if="can('collector.view')" flat round dense icon="visibility" :aria-label="t('collectors.actions.view')" @click="viewCollector(slotProps.row)">
            <q-tooltip>{{ t('collectors.actions.view') }}</q-tooltip>
          </q-btn>
          <q-btn v-if="can('collector.edit')" flat round dense icon="edit" :aria-label="t('common.edit')" @click="openEditDialog(slotProps.row)">
            <q-tooltip>{{ t('common.edit') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="slotProps.row.status === 'INACTIVE' && can('collector.edit')"
            flat
            round
            dense
            icon="play_arrow"
            :aria-label="t('collectors.actions.activate')"
            @click="confirmStatusChange(slotProps.row)"
          >
            <q-tooltip>{{ t('collectors.actions.activate') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else-if="slotProps.row.status === 'ACTIVE' && can('collector.edit')"
            flat
            round
            dense
            icon="pause"
            :aria-label="t('collectors.actions.deactivate')"
            @click="confirmStatusChange(slotProps.row)"
          >
            <q-tooltip>{{ t('collectors.actions.deactivate') }}</q-tooltip>
          </q-btn>
          <q-btn v-if="can('collector.delete')" flat round dense color="negative" icon="delete" :aria-label="t('common.delete')" @click="confirmDelete(slotProps.row)">
            <q-tooltip>{{ t('common.delete') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #no-data>
        <div class="full-width row flex-center text-grey-7 q-gutter-sm q-pa-lg">
          <q-icon name="inbox" size="sm" />
          <span>{{ filters.search || filters.status !== 'ALL' ? t('collectors.empty.filtered') : t('collectors.empty.list') }}</span>
        </div>
      </template>
    </q-table>

    <CollectorFormDialog
      v-model="formDialog"
      :collector="selectedCollector"
      :references="references"
      :saving="saving"
      :error-message="formError"
      @save="saveCollector"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthorization } from 'src/composables/useAuthorization';
import CollectorFiltersComponent from 'src/components/collectors/CollectorFiltersComponent.vue';
import CollectorFormDialog from 'src/components/collectors/CollectorFormDialog.vue';
import type {
  Collector,
  CollectorFilters,
  CollectorFormValue,
  CollectorReferenceData,
} from 'src/models/collector';
import { CollectorValidationError, collectorService } from 'src/services/collector.service';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const { can } = useAuthorization();
const collectors = ref<Collector[]>([]);
const filters = ref<CollectorFilters>({ search: '', status: 'ALL' });
const references = ref<CollectorReferenceData>({ equipment: [], originVersions: [] });
const selectedCollector = ref<Collector | null>(null);
const formDialog = ref(false);
const loading = ref(false);
const referencesLoading = ref(true);
const saving = ref(false);
const pageError = ref(false);
const pageErrorMessage = ref('collectors.errors.load');
const formError = ref('');
let listRequest = 0;

const columns = computed<QTableColumn[]>(() => [
  { name: 'code', label: t('collectors.fields.code'), field: 'code', align: 'left', sortable: true },
  { name: 'name', label: t('collectors.fields.name'), field: 'name', align: 'left', sortable: true },
  { name: 'equipmentId', label: t('collectors.fields.equipment'), field: 'equipmentId', align: 'left' },
  { name: 'originVersionId', label: t('collectors.fields.originVersion'), field: 'originVersionId', align: 'left' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' },
  {
    name: 'lastExecutionStatus',
    label: t('collectors.fields.lastExecutionStatus'),
    field: 'lastExecutionStatus',
    align: 'left',
  },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' },
]);

watch(filters, () => void loadCollectors(), { deep: true });
onMounted(() => void loadPage());

async function loadPage(): Promise<void> {
  referencesLoading.value = true;
  try {
    references.value = await collectorService.getReferenceData();
    await loadCollectors();
  } catch {
    pageErrorMessage.value = 'collectors.errors.load';
    pageError.value = true;
  } finally {
    referencesLoading.value = false;
  }
}

async function loadCollectors(): Promise<void> {
  const request = ++listRequest;
  loading.value = true;
  pageError.value = false;
  try {
    const result = await collectorService.listCollectors(filters.value);
    if (request === listRequest) collectors.value = result;
  } catch {
    if (request === listRequest) {
      pageErrorMessage.value = 'collectors.errors.load';
      pageError.value = true;
    }
  } finally {
    if (request === listRequest) loading.value = false;
  }
}

function referenceName(kind: 'equipment' | 'originVersions', id: unknown): string {
  if (typeof id !== 'string') return t('common.notAvailable');
  return references.value[kind].find((reference) => reference.id === id)?.name ?? t('common.notAvailable');
}

function executionStatusColor(status: string): string {
  if (status === 'SUCCESS') return 'positive';
  if (status === 'ERROR') return 'negative';
  return 'warning';
}

function viewCollector(collector: Collector): void {
  void router.push({ name: 'collector-detail', params: { id: collector.id } });
}

function openCreateDialog(): void {
  selectedCollector.value = null;
  formError.value = '';
  formDialog.value = true;
}

function openEditDialog(collector: Collector): void {
  selectedCollector.value = collector;
  formError.value = '';
  formDialog.value = true;
}

async function saveCollector(value: CollectorFormValue): Promise<void> {
  saving.value = true;
  formError.value = '';
  try {
    if (selectedCollector.value) {
      await collectorService.updateCollector(selectedCollector.value.id, value);
      notify('positive', 'collectors.messages.updated');
    } else {
      await collectorService.createCollector(value);
      notify('positive', 'collectors.messages.created');
    }
    formDialog.value = false;
    selectedCollector.value = null;
    await loadCollectors();
  } catch (error) {
    if (error instanceof CollectorValidationError) {
      formError.value = t(`collectors.validation.${error.code}`);
    } else {
      formError.value = t('collectors.errors.save');
    }
  } finally {
    saving.value = false;
  }
}

function confirmDelete(collector: Collector): void {
  $q.dialog({
    title: t('collectors.confirm.deleteTitle'),
    message: t('collectors.confirm.deleteMessage', { name: collector.name }),
    cancel: { label: t('common.cancel'), flat: true },
    ok: { label: t('common.delete'), color: 'negative' },
    persistent: true,
  }).onOk(() => void deleteCollector(collector));
}

async function deleteCollector(collector: Collector): Promise<void> {
  try {
    const deleted = await collectorService.deleteCollector(collector.id);
    if (!deleted) throw new Error('not-found');
    notify('positive', 'collectors.messages.deleted');
    await loadCollectors();
  } catch {
    showOperationError();
  }
}

function confirmStatusChange(collector: Collector): void {
  const activating = collector.status === 'INACTIVE';
  $q.dialog({
    title: t(activating ? 'collectors.confirm.activateTitle' : 'collectors.confirm.deactivateTitle'),
    message: t(activating ? 'collectors.confirm.activateMessage' : 'collectors.confirm.deactivateMessage', {
      name: collector.name,
    }),
    cancel: { label: t('common.cancel'), flat: true },
    ok: { label: t(activating ? 'collectors.actions.activate' : 'collectors.actions.deactivate'), color: 'primary' },
    persistent: true,
  }).onOk(() => void setCollectorStatus(collector, activating));
}

async function setCollectorStatus(collector: Collector, activating: boolean): Promise<void> {
  try {
    const updated = activating
      ? await collectorService.activateCollector(collector.id)
      : await collectorService.deactivateCollector(collector.id);
    if (!updated) throw new Error('not-found');
    notify('positive', activating ? 'collectors.messages.activated' : 'collectors.messages.deactivated');
    await loadCollectors();
  } catch {
    showOperationError();
  }
}

function showOperationError(): void {
  pageErrorMessage.value = 'collectors.errors.operation';
  pageError.value = true;
  notify('negative', 'collectors.errors.operation');
}

function notify(type: 'positive' | 'negative', message: string): void {
  $q.notify({ type, message: t(message), timeout: 2200 });
}
</script>
