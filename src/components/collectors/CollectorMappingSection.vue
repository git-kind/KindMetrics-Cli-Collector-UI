<template>
  <div class="q-gutter-md">
    <q-card flat bordered class="rounded-borders">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-medium">{{ t('collectors.mapping.title') }}</div>
        <q-btn flat color="primary" icon="add" :label="t('collectors.mapping.addRule')" @click="openCreateDialog" />
      </q-card-section>

      <q-table flat bordered row-key="id" :rows="rows" :columns="columns" :pagination="{ rowsPerPage: 10 }">
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="statusColor(props.value)" :label="statusLabel(props.value)" />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-btn flat round dense icon="visibility" color="primary" :title="t('collectors.mapping.view')" @click="openDetail(props.row)" />
              <q-btn flat round dense icon="edit" color="primary" :title="t('collectors.mapping.edit')" @click="openEditDialog(props.row)" />
              <q-btn flat round dense icon="delete" color="negative" :title="t('collectors.mapping.delete')" @click="deleteMapping(props.row)" />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="mapping-form-dialog">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ isEditing ? t('collectors.mapping.editRule') : t('collectors.mapping.newRule') }}</div>
          <q-btn flat round dense icon="close" v-close-popup @click="closeDialog" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="form.dataId"
            :options="dataOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :label="t('collectors.mapping.data')"
            :rules="[requiredRule]"
          />

          <div class="q-gutter-sm">
            <div class="text-subtitle2 text-weight-medium">{{ t('collectors.mapping.origin') }}</div>
            <q-select
              v-model="form.acquisitionMethodId"
              :options="sourceMethodOptions"
              emit-value
              map-options
              :label="t('collectors.mapping.sourceMethod')"
              :rules="[requiredRule]"
            />

            <q-select
              v-model="form.sourceField"
              :options="sourceFieldOptions"
              emit-value
              map-options
              :label="t('collectors.mapping.sourceField')"
              :rules="[requiredRule]"
            />
          </div>

          <div class="q-gutter-sm">
            <div class="text-subtitle2 text-weight-medium">{{ t('collectors.mapping.transformation') }}</div>
            <q-select
              v-model="form.transformation"
              :options="transformationOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :label="t('collectors.mapping.transformation')"
              :rules="[requiredRule]"
            />

            <q-input
              v-if="showTransformationConfig"
              v-model="transformationConfigText"
              outlined
              :label="t('collectors.mapping.transformationConfig')"
              :placeholder="t('collectors.mapping.transformationConfigPlaceholder')"
            />
          </div>

          <div class="q-gutter-sm">
            <div class="text-subtitle2 text-weight-medium">{{ t('collectors.mapping.destination') }}</div>
            <q-select
              v-model="form.destinationTable"
              :options="destinationTableOptions"
              emit-value
              map-options
              :label="t('collectors.mapping.targetTable')"
              :rules="[requiredRule]"
            />

            <q-select
              v-model="form.destinationField"
              :options="destinationFieldOptions"
              emit-value
              map-options
              :label="t('collectors.mapping.targetField')"
              :rules="[requiredRule]"
            />
          </div>

          <q-banner v-if="formError" rounded class="bg-negative text-white">
            {{ formError }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="t('common.cancel')" color="primary" @click="closeDialog" />
          <q-btn color="primary" :label="t('common.save')" @click="submitForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailDialogOpen" persistent>
      <q-card class="mapping-detail-dialog">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ t('collectors.mapping.detailTitle') }}</div>
          <q-btn flat round dense icon="close" v-close-popup @click="detailDialogOpen = false" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedDetail" class="q-gutter-md">
          <div>
            <div class="text-caption text-grey-6">{{ t('collectors.mapping.data') }}</div>
            <div class="text-subtitle2">{{ selectedDetail.dataId }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-6">{{ t('collectors.mapping.origin') }}</div>
            <div class="text-body2">{{ t('collectors.mapping.sourceMethod') }}: {{ selectedDetail.acquisitionMethodId }}</div>
            <div class="text-body2">{{ t('collectors.mapping.sourceField') }}: {{ selectedDetail.sourceField }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-6">{{ t('collectors.mapping.transformation') }}</div>
            <div class="text-body2">{{ transformationLabel(selectedDetail.transformation) }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-6">{{ t('collectors.mapping.destination') }}</div>
            <div class="text-body2">{{ t('collectors.mapping.targetTable') }}: {{ selectedDetail.destinationTable }}</div>
            <div class="text-body2">{{ t('collectors.mapping.targetField') }}: {{ selectedDetail.destinationField }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-6">{{ t('collectors.mapping.status') }}</div>
            <q-badge :color="statusColor(selectedDetail.status)" :label="statusLabel(selectedDetail.status)" />
          </div>

          <div v-if="detailTestResult">
            <div class="text-caption text-grey-6">{{ t('collectors.mapping.test') }}</div>
            <div class="text-body2">{{ detailTestResult.message }}</div>
            <div v-if="detailTestResult.sampleValue !== undefined" class="text-body2">
              {{ t('collectors.mapping.sampleValue') }}: {{ detailTestResult.sampleValue }}
            </div>
            <div v-if="detailTestResult.destinationValue" class="text-body2">
              {{ t('collectors.mapping.result') }}: {{ detailTestResult.destinationValue }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="t('collectors.mapping.test')" color="secondary" @click="runMappingTest(selectedDetail)" v-if="selectedDetail" />
          <q-btn flat :label="t('collectors.mapping.edit')" color="primary" @click="openEditDialog(selectedDetail)" v-if="selectedDetail" />
          <q-btn flat :label="t('collectors.mapping.delete')" color="negative" @click="deleteMapping(selectedDetail)" v-if="selectedDetail" />
          <q-btn flat :label="t('common.cancel')" color="primary" @click="detailDialogOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { Collector, CollectorAcquisitionDataItem } from 'src/models/collector';
import type {
  DataMapping,
  DataMappingFormValue,
  DataMappingTestResult,
  MappingTransformationType,
} from 'src/models/mapping';
import { mappingService } from 'src/services/mapping.service';

const props = defineProps<{ collector: Collector }>();
const { t } = useI18n();

const rows = ref<DataMapping[]>([]);
const dialogOpen = ref(false);
const detailDialogOpen = ref(false);
const formError = ref('');
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const selectedDetail = ref<DataMapping | null>(null);
const detailTestResult = ref<DataMappingTestResult | null>(null);
const transformationConfigText = ref('');

const form = reactive<DataMappingFormValue>({
  collectorId: props.collector.id,
  dataId: '',
  acquisitionMethodId: '',
  sourceField: '',
  transformation: 'NONE',
  transformationConfig: null,
  destinationTable: 'calls',
  destinationField: '',
});

const defaultDataItems: CollectorAcquisitionDataItem[] = [
  {
    id: 'data-numero-llamadas',
    name: 'NumeroLlamadas',
    description: 'Número total de llamadas',
    status: 'ACTIVE',
    methodType: 'API',
    methodName: 'API - CDR',
    connection: { name: 'API - CDR', type: 'API', status: 'OK', url: 'https://api.example.com', port: 443, authentication: 'Bearer', timeout: 30, tls: true },
    extraction: { name: 'API extraction', method: 'GET', httpMethod: 'GET', endpoint: '/cdr', responseFormat: 'JSON', jsonPath: 'data.totalCalls' },
  },
  {
    id: 'data-calling-number',
    name: 'CallingNumber',
    description: 'Número de origen',
    status: 'ACTIVE',
    methodType: 'API',
    methodName: 'API - CDR',
    connection: { name: 'API - CDR', type: 'API', status: 'OK', url: 'https://api.example.com', port: 443, authentication: 'Bearer', timeout: 30, tls: true },
    extraction: { name: 'API extraction', method: 'GET', httpMethod: 'GET', endpoint: '/cdr', responseFormat: 'JSON', jsonPath: 'data.callingNumber' },
  },
  {
    id: 'data-duration',
    name: 'Duration',
    description: 'Duración de la llamada',
    status: 'ACTIVE',
    methodType: 'API',
    methodName: 'API - CDR',
    connection: { name: 'API - CDR', type: 'API', status: 'OK', url: 'https://api.example.com', port: 443, authentication: 'Bearer', timeout: 30, tls: true },
    extraction: { name: 'API extraction', method: 'GET', httpMethod: 'GET', endpoint: '/cdr', responseFormat: 'JSON', jsonPath: 'data.duration' },
  },
  {
    id: 'data-start-time',
    name: 'StartTime',
    description: 'Hora de inicio de la llamada',
    status: 'ACTIVE',
    methodType: 'API',
    methodName: 'API - CDR',
    connection: { name: 'API - CDR', type: 'API', status: 'OK', url: 'https://api.example.com', port: 443, authentication: 'Bearer', timeout: 30, tls: true },
    extraction: { name: 'API extraction', method: 'GET', httpMethod: 'GET', endpoint: '/cdr', responseFormat: 'JSON', jsonPath: 'data.startTime' },
  },
];

const fallbackMappings = (): DataMapping[] => [
  {
    id: 'mapping-default-1',
    collectorId: props.collector.id,
    dataId: 'NumeroLlamadas',
    acquisitionMethodId: 'API - CDR',
    sourceField: 'totalCalls',
    transformation: 'NONE',
    transformationConfig: null,
    destinationTable: 'calls',
    destinationField: 'total_calls',
    status: 'CONFIGURADA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mapping-default-2',
    collectorId: props.collector.id,
    dataId: 'CallingNumber',
    acquisitionMethodId: 'API - CDR',
    sourceField: 'callingNumber',
    transformation: 'NONE',
    transformationConfig: null,
    destinationTable: 'calls',
    destinationField: 'calling_number',
    status: 'CONFIGURADA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const dataOptions = computed(() => {
  const config = (props.collector.configuration ?? {}) as Record<string, unknown>;
  const acquisitionData = Array.isArray(config.acquisitionData)
    ? (config.acquisitionData as CollectorAcquisitionDataItem[])
    : defaultDataItems;

  return acquisitionData.map((item) => ({
    label: item.name,
    value: item.name,
  }));
});

const sourceFieldMap: Record<string, string[]> = {
  NumeroLlamadas: ['totalCalls'],
  CallingNumber: ['callingNumber'],
  CalledNumber: ['calledNumber'],
  Duration: ['duration'],
  StartTime: ['startTime'],
};

const sourceMethodOptions = computed(() => {
  const selected = dataOptions.value.find((item) => item.value === form.dataId);
  if (!selected) return ['API - CDR', 'SNMP - Equipo', 'Webhook - Eventos', 'Microsoft Teams'];
  const item = defaultDataItems.find((entry) => entry.name === selected.value);
  return item ? [item.methodName] : ['API - CDR'];
});

const sourceFieldOptions = computed(() => {
  const values = sourceFieldMap[form.dataId] ?? ['totalCalls', 'callingNumber', 'calledNumber', 'duration', 'startTime'];
  return values;
});

const destinationStructure: Record<string, string[]> = {
  calls: ['id', 'calling_number', 'called_number', 'duration', 'start_time', 'status', 'total_calls'],
  call_events: ['id', 'call_id', 'event_type', 'event_at'],
};

const destinationTableOptions = computed(() => Object.keys(destinationStructure));
const destinationFieldOptions = computed(() => destinationStructure[form.destinationTable] ?? []);

const transformationOptions = computed(() => [
  { label: t('collectors.mapping.transformations.NONE'), value: 'NONE' },
  { label: t('collectors.mapping.transformations.CONVERT_TYPE'), value: 'CONVERT_TYPE' },
  { label: t('collectors.mapping.transformations.MULTIPLY'), value: 'MULTIPLY' },
  { label: t('collectors.mapping.transformations.DIVIDE'), value: 'DIVIDE' },
  { label: t('collectors.mapping.transformations.ADD'), value: 'ADD' },
  { label: t('collectors.mapping.transformations.SUBTRACT'), value: 'SUBTRACT' },
  { label: t('collectors.mapping.transformations.EXTRACT'), value: 'EXTRACT' },
  { label: t('collectors.mapping.transformations.MAP_VALUE'), value: 'MAP_VALUE' },
]);

const showTransformationConfig = computed(() => form.transformation !== 'NONE');

const columns = computed<QTableColumn[]>(() => [
  { name: 'logicalField', label: t('collectors.mapping.data'), field: 'dataId', align: 'left' },
  { name: 'sourceMethod', label: t('collectors.mapping.sourceMethod'), field: 'acquisitionMethodId', align: 'left' },
  { name: 'sourceField', label: t('collectors.mapping.sourceField'), field: 'sourceField', align: 'left' },
  { name: 'transformation', label: t('collectors.mapping.transformation'), field: 'transformation', align: 'left' },
  { name: 'targetTable', label: t('collectors.mapping.targetTable'), field: 'destinationTable', align: 'left' },
  { name: 'targetField', label: t('collectors.mapping.targetField'), field: 'destinationField', align: 'left' },
  { name: 'status', label: t('collectors.mapping.status'), field: 'status', align: 'center' },
  { name: 'actions', label: t('common.actions'), field: 'actions', align: 'center' },
]);

const requiredRule = (value: string | null | undefined): boolean | string => !!value?.trim() || t('common.required');

watch(
  () => props.collector.id,
  async () => {
    await loadMappings();
  },
  { immediate: true },
);

watch(
  () => form.dataId,
  (nextValue) => {
    const item = defaultDataItems.find((entry) => entry.name === nextValue);
    form.acquisitionMethodId = item?.methodName ?? 'API - CDR';
    const values = sourceFieldMap[nextValue] ?? ['totalCalls'];
    if (!values.includes(form.sourceField)) {
      form.sourceField = values[0] ?? '';
    }
  },
);

watch(
  () => form.destinationTable,
  (nextTable) => {
    const values = destinationStructure[nextTable] ?? [];
    if (!values.includes(form.destinationField)) {
      form.destinationField = values[0] ?? '';
    }
  },
);

watch(
  () => form.transformation,
  (nextTransformation) => {
    if (nextTransformation === 'NONE') {
      transformationConfigText.value = '';
      form.transformationConfig = null;
      return;
    }

    if (!transformationConfigText.value.trim()) {
      transformationConfigText.value = nextTransformation === 'MULTIPLY' || nextTransformation === 'DIVIDE' ? '100' : '10';
    }
    form.transformationConfig = { value: transformationConfigText.value };
  },
);

watch(
  () => transformationConfigText.value,
  (nextValue) => {
    if (form.transformation === 'NONE') return;
    form.transformationConfig = { value: nextValue };
  },
);

async function loadMappings(): Promise<void> {
  const mappings = await mappingService.listMappings(props.collector.id);
  rows.value = mappings.length > 0 ? mappings : fallbackMappings();
}

function transformationLabel(value: MappingTransformationType): string {
  const mapping: Record<MappingTransformationType, string> = {
    NONE: t('collectors.mapping.transformations.NONE'),
    CONVERT_TYPE: t('collectors.mapping.transformations.CONVERT_TYPE'),
    MULTIPLY: t('collectors.mapping.transformations.MULTIPLY'),
    DIVIDE: t('collectors.mapping.transformations.DIVIDE'),
    ADD: t('collectors.mapping.transformations.ADD'),
    SUBTRACT: t('collectors.mapping.transformations.SUBTRACT'),
    EXTRACT: t('collectors.mapping.transformations.EXTRACT'),
    MAP_VALUE: t('collectors.mapping.transformations.MAP_VALUE'),
  };
  return mapping[value] ?? value;
}

function resetForm(): void {
  form.collectorId = props.collector.id;
  form.dataId = dataOptions.value[0]?.value ?? '';
  form.acquisitionMethodId = sourceMethodOptions.value[0] ?? '';
  form.sourceField = sourceFieldOptions.value[0] ?? '';
  form.transformation = 'NONE';
  form.transformationConfig = null;
  form.destinationTable = destinationTableOptions.value[0] ?? 'calls';
  form.destinationField = destinationFieldOptions.value[0] ?? '';
  transformationConfigText.value = '';
  formError.value = '';
}

function openCreateDialog(): void {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  dialogOpen.value = true;
}

function openEditDialog(row: DataMapping | null): void {
  if (!row) return;
  isEditing.value = true;
  editingId.value = row.id;
  form.collectorId = props.collector.id;
  form.dataId = row.dataId;
  form.acquisitionMethodId = row.acquisitionMethodId;
  form.sourceField = row.sourceField;
  form.transformation = row.transformation;
  transformationConfigText.value = row.transformationConfig && typeof row.transformationConfig === 'object' && 'value' in row.transformationConfig ? String(row.transformationConfig.value) : '';
  form.transformationConfig = row.transformationConfig;
  form.destinationTable = row.destinationTable;
  form.destinationField = row.destinationField;
  formError.value = '';
  detailDialogOpen.value = false;
  dialogOpen.value = true;
}

function closeDialog(): void {
  dialogOpen.value = false;
  isEditing.value = false;
  editingId.value = null;
  formError.value = '';
  transformationConfigText.value = '';
}

function statusColor(status: DataMapping['status']): string {
  if (status === 'CONFIGURADA') return 'positive';
  if (status === 'INCOMPLETA') return 'warning';
  return 'negative';
}

function statusLabel(status: DataMapping['status']): string {
  const labels: Record<DataMapping['status'], string> = {
    CONFIGURADA: t('collectors.mapping.configured'),
    INCOMPLETA: t('collectors.mapping.incomplete'),
    ERROR: t('collectors.mapping.error'),
  };
  return labels[status] ?? status;
}

function toPayload(): DataMappingFormValue {
  return {
    collectorId: props.collector.id,
    dataId: form.dataId,
    acquisitionMethodId: form.acquisitionMethodId,
    sourceField: form.sourceField,
    transformation: form.transformation,
    transformationConfig: form.transformation === 'NONE' ? null : { value: transformationConfigText.value },
    destinationTable: form.destinationTable,
    destinationField: form.destinationField,
  };
}

async function submitForm(): Promise<void> {
  const payload = toPayload();
  const validation = await mappingService.validateMapping(props.collector.id, payload);

  if (!validation.valid) {
    formError.value = validation.errors.join(' ');
    return;
  }

  if (isEditing.value && editingId.value) {
    await mappingService.updateMapping(props.collector.id, editingId.value, payload);
    globalThis.alert(t('collectors.mapping.messages.updated'));
  } else {
    await mappingService.createMapping(props.collector.id, payload);
    globalThis.alert(t('collectors.mapping.messages.created'));
  }

  await loadMappings();
  closeDialog();
}

async function deleteMapping(row: DataMapping | null): Promise<void> {
  if (!row) return;
  const confirmText = t('collectors.mapping.confirmDelete', { name: row.dataId });
  if (!globalThis.confirm(confirmText)) return;
  await mappingService.deleteMapping(props.collector.id, row.id);
  await loadMappings();
  detailDialogOpen.value = false;
  globalThis.alert(t('collectors.mapping.messages.deleted'));
}

function openDetail(row: DataMapping): void {
  selectedDetail.value = row;
  detailTestResult.value = null;
  detailDialogOpen.value = true;
}

async function runMappingTest(row: DataMapping | null): Promise<void> {
  if (!row) return;
  const result = await mappingService.testMapping(props.collector.id, row.id);
  detailTestResult.value = result;
  if (result) {
    globalThis.alert(result.message);
  }
}
</script>

<style scoped>
.mapping-form-dialog {
  width: min(620px, calc(100vw - 32px));
  max-width: 620px;
}

.mapping-detail-dialog {
  width: min(560px, calc(100vw - 32px));
  max-width: 560px;
}
</style>

