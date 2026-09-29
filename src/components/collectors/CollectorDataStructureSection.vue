<template>
  <div class="collector-db-admin">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-medium">{{ t('collectors.dataStructure.title') }}</div>
        <div class="text-caption text-grey-6">{{ t('collectors.dataStructure.databaseLabel') }}: KindMetrics</div>
      </div>
      <q-chip :color="stateColor" text-color="white" :label="t(`collectors.dataStructure.statusLabel.${statusKey}`)" />
    </div>

    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner color="primary" size="30px" />
    </div>

    <q-splitter v-else v-model="splitterModel" unit="px" style="height: 720px" class="db-splitter">
      <template #before>
        <div class="db-sidebar">
          <div class="db-sidebar-header">
            <div class="text-subtitle2 text-weight-medium">{{ t('collectors.dataStructure.database') }}</div>
          </div>

          <q-input
            v-model="tableSearch"
            dense
            outlined
            :placeholder="t('collectors.dataStructure.searchTables')"
            class="q-mb-md"
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle3 text-weight-medium">{{ t('collectors.dataStructure.tables') }}</div>
          </div>

          <q-tree
            :nodes="treeNodes"
            node-key="key"
            :selected="selectedTableId"
            :default-expand-all="true"
            class="db-tree"
            @update:selected="onTableSelected"
          />

          <q-btn
            class="full-width q-mt-md"
            icon="add"
            color="primary"
            :label="t('collectors.dataStructure.actions.addTable')"
            @click="openCreateTable"
          />
        </div>
      </template>

      <template #after>
        <div v-if="!selectedTable" class="empty-db-panel">
          <div class="text-h6 text-weight-medium">{{ t('collectors.dataStructure.noTables') }}</div>
          <q-btn class="q-mt-md" color="primary" icon="add" :label="t('collectors.dataStructure.actions.addTable')" @click="openCreateTable" />
        </div>

        <div v-else class="db-detail-panel">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-h6 text-weight-medium">{{ selectedTable.name }}</div>
              <div v-if="selectedTable.description" class="text-caption text-grey-6">
                {{ t('collectors.dataStructure.description') }}: {{ selectedTable.description }}
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn flat dense color="primary" icon="edit" :label="t('common.edit')" @click="openEditTable(selectedTable)" />
              <q-btn flat dense color="negative" icon="delete" :label="t('common.delete')" @click="deleteTable(selectedTable.id)" />
            </div>
          </div>

          <div v-if="validationMessage" class="q-mb-md db-status-banner">
            {{ validationMessage }}
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <q-btn outline color="primary" :label="t('collectors.dataStructure.validate')" icon="verified" @click="validateStructure" />
            <q-btn outline color="secondary" :label="t('collectors.dataStructure.preview')" icon="preview" @click="previewChanges" />
            <q-btn color="secondary" :label="t('collectors.dataStructure.apply')" icon="done_all" @click="applyChanges" />
          </div>

          <q-tabs v-model="activeDetailTab" inline-label class="db-tabs">
            <q-tab name="structure" :label="t('collectors.dataStructure.structureTab')" />
            <q-tab name="indexes" :label="t('collectors.dataStructure.indexesTab')" />
          </q-tabs>

          <q-tab-panels v-model="activeDetailTab" animated class="bg-transparent">
            <q-tab-panel name="structure" class="q-pa-none">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-medium">{{ t('collectors.dataStructure.columns') }}</div>
                <q-btn size="sm" color="primary" icon="add" :label="t('collectors.dataStructure.actions.addField')" @click="openCreateField(selectedTable.id)" />
              </div>

              <q-table flat bordered :rows="selectedTable.fields.map((field, index) => ({ ...field, position: index + 1 }))" :columns="fieldColumns" row-key="id" class="db-table">
                <template #body-cell-name="props">
                  <q-td :props="props">
                    <span class="text-weight-medium">{{ props.value }}</span>
                  </q-td>
                </template>
                <template #body-cell-type="props">
                  <q-td :props="props">
                    {{ formatType(props.value) }}
                  </q-td>
                </template>
                <template #body-cell-nullable="props">
                  <q-td :props="props">
                    {{ props.value ? '✓' : '—' }}
                  </q-td>
                </template>
                <template #body-cell-primaryKey="props">
                  <q-td :props="props">
                    {{ props.value ? '✓' : '—' }}
                  </q-td>
                </template>
                <template #body-cell-actions="props">
                  <q-td :props="props">
                    <div class="row q-gutter-xs">
                      <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openEditField(selectedTable.id, props.row)" />
                      <q-btn flat round dense icon="delete" size="sm" color="negative" @click="deleteField(selectedTable.id, props.row.id)" />
                    </div>
                  </q-td>
                </template>
              </q-table>
            </q-tab-panel>

            <q-tab-panel name="indexes" class="q-pa-none">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-medium">{{ t('collectors.dataStructure.indexes') }}</div>
                <q-btn size="sm" color="primary" icon="add" :label="t('collectors.dataStructure.actions.addIndex')" @click="openCreateIndex(selectedTable.id)" />
              </div>

              <q-table flat bordered :rows="selectedTable.indexes" :columns="indexColumns" row-key="id" class="db-table">
                <template #body-cell-columns="props">
                  <q-td :props="props">
                    {{ props.value.join(', ') || '—' }}
                  </q-td>
                </template>
                <template #body-cell-actions="props">
                  <q-td :props="props">
                    <div class="row q-gutter-xs">
                      <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openEditIndex(selectedTable.id, props.row)" />
                      <q-btn flat round dense icon="delete" size="sm" color="negative" @click="deleteIndex(selectedTable.id, props.row.id)" />
                    </div>
                  </q-td>
                </template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
    </q-splitter>

    <CollectorTableFormDialog v-model="tableDialogOpen" :table="editingTable" :duplicate-names="tableNames" @save="handleTableSave" />
    <CollectorFieldFormDialog v-model="fieldDialogOpen" :field="editingField" :existing-names="currentTableFields" @save="handleFieldSave" />
    <CollectorIndexFormDialog v-model="indexDialogOpen" :index="editingIndex" :field-options="currentTableFieldNames" @save="handleIndexSave" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Collector, CollectorDataStructure, CollectorField, CollectorIndex, CollectorTable } from 'src/models/collector';
import { collectorService } from 'src/services/collector.service';
import CollectorFieldFormDialog from 'src/components/collectors/CollectorFieldFormDialog.vue';
import CollectorIndexFormDialog from 'src/components/collectors/CollectorIndexFormDialog.vue';
import CollectorTableFormDialog from 'src/components/collectors/CollectorTableFormDialog.vue';

const props = defineProps<{ collector: Collector }>();
const { t } = useI18n();

const structure = ref<CollectorDataStructure | null>(null);
const loading = ref(false);
const validationMessage = ref<string | null>(null);
const tableDialogOpen = ref(false);
const fieldDialogOpen = ref(false);
const indexDialogOpen = ref(false);
const editingTable = ref<CollectorTable | null>(null);
const editingField = ref<CollectorField | null>(null);
const editingIndex = ref<CollectorIndex | null>(null);
const selectedTableId = ref<string | null>(null);
const tableSearch = ref('');
const splitterModel = ref(320);
const activeDetailTab = ref<'structure' | 'indexes'>('structure');

watch(
  () => props.collector.id,
  () => {
    void loadStructure();
  },
  { immediate: true },
);

watch(
  structure,
  (value) => {
    if (!value) {
      selectedTableId.value = null;
      return;
    }
    if (!selectedTableId.value || !value.tables.some((table) => table.id === selectedTableId.value)) {
      selectedTableId.value = value.tables[0]?.id ?? null;
    }
  },
  { immediate: true },
);

const filteredTables = computed(() => {
  const query = tableSearch.value.trim().toLowerCase();
  return (structure.value?.tables ?? []).filter((table) => {
    if (!query) return true;
    return table.name.toLowerCase().includes(query) || table.description.toLowerCase().includes(query);
  });
});

const selectedTable = computed(() => structure.value?.tables.find((table) => table.id === selectedTableId.value) ?? null);

const statusKey = computed(() => {
  const mapping: Record<string, string> = {
    NOT_DEFINED: 'notDefined',
    DEFINED: 'defined',
    SYNCED: 'synced',
    PENDING_CHANGES: 'pendingChanges',
    ERROR: 'error',
  };
  return mapping[structure.value?.status ?? 'DEFINED'] ?? 'defined';
});

const stateColor = computed(() => {
  switch (structure.value?.status) {
    case 'SYNCED':
      return 'positive';
    case 'PENDING_CHANGES':
      return 'warning';
    case 'ERROR':
      return 'negative';
    default:
      return 'grey';
  }
});

const tableNames = computed(() => structure.value?.tables.map((table) => table.name) ?? []);
const currentTableFields = computed(() => {
  const table = selectedTable.value ?? structure.value?.tables.find((item) => item.id === selectedTableId.value);
  return table?.fields.map((field) => field.name) ?? [];
});
const currentTableFieldNames = computed(() => currentTableFields.value);
const treeNodes = computed(() => [{
  key: 'database-root',
  label: t('collectors.dataStructure.database'),
  icon: 'storage',
  children: filteredTables.value.map((table) => ({
    key: table.id,
    label: table.name,
    icon: 'table_chart',
    selectable: true,
  })),
}]);

const fieldColumns = [
  { name: 'position', label: '#', field: 'position', align: 'left' as const },
  { name: 'name', label: t('collectors.dataStructure.nameColumn'), field: 'name', align: 'left' as const },
  { name: 'type', label: t('collectors.dataStructure.typeColumn'), field: 'type', align: 'left' as const },
  { name: 'nullable', label: t('collectors.dataStructure.nullColumn'), field: 'nullable', align: 'center' as const },
  { name: 'primaryKey', label: t('collectors.dataStructure.primaryKey'), field: 'primaryKey', align: 'center' as const },
  { name: 'defaultValue', label: t('collectors.dataStructure.defaultValue'), field: 'defaultValue', align: 'left' as const },
  { name: 'actions', label: t('common.actions'), field: 'actions', align: 'center' as const },
];

const indexColumns = [
  { name: 'name', label: t('collectors.dataStructure.nameColumn'), field: 'name', align: 'left' as const },
  { name: 'type', label: t('collectors.dataStructure.typeColumn'), field: 'type', align: 'left' as const },
  { name: 'columns', label: t('collectors.dataStructure.columns'), field: 'columns', align: 'left' as const },
  { name: 'actions', label: t('common.actions'), field: 'actions', align: 'center' as const },
];

function formatType(type: string): string {
  return type || '—';
}

async function loadStructure(): Promise<void> {
  if (!props.collector?.id) return;
  loading.value = true;
  try {
    structure.value = await collectorService.getDataStructure(props.collector.id);
    validationMessage.value = structure.value?.lastValidationMessage ?? null;
  } finally {
    loading.value = false;
  }
}

function onTableSelected(selection: string | string[] | null): void {
  const value = Array.isArray(selection) ? selection[0] : selection;
  if (value && value !== 'database-root') {
    selectedTableId.value = value;
  }
}

function openCreateTable(): void {
  editingTable.value = null;
  tableDialogOpen.value = true;
}

function openEditTable(table: CollectorTable): void {
  editingTable.value = table;
  tableDialogOpen.value = true;
}

async function handleTableSave(payload: { name: string; description: string }): Promise<void> {
  if (!props.collector.id) return;
  if (editingTable.value) {
    const updated = await collectorService.updateTable(props.collector.id, editingTable.value.id, {
      name: payload.name,
      description: payload.description,
    });
    if (updated) selectedTableId.value = updated.id;
  } else {
    const created = await collectorService.createTable(props.collector.id, {
      name: payload.name,
      description: payload.description,
    });
    if (created) selectedTableId.value = created.id;
  }
  tableDialogOpen.value = false;
  editingTable.value = null;
  await loadStructure();
}

async function deleteTable(tableId: string): Promise<void> {
  if (!globalThis.confirm(t('collectors.dataStructure.confirmDeleteTable')) || !props.collector.id) return;
  await collectorService.deleteTable(props.collector.id, tableId);
  await loadStructure();
}

function openCreateField(tableId: string): void {
  selectedTableId.value = tableId;
  editingField.value = null;
  fieldDialogOpen.value = true;
}

function openEditField(tableId: string, field: CollectorField): void {
  selectedTableId.value = tableId;
  editingField.value = field;
  fieldDialogOpen.value = true;
}

async function handleFieldSave(payload: Omit<CollectorField, 'id'>): Promise<void> {
  if (!props.collector.id || !selectedTableId.value) return;
  const tableId = selectedTableId.value;
  if (editingField.value) {
    await collectorService.updateField(props.collector.id, tableId, editingField.value.id, payload);
  } else {
    await collectorService.createField(props.collector.id, tableId, payload);
  }
  fieldDialogOpen.value = false;
  editingField.value = null;
  await loadStructure();
}

async function deleteField(tableId: string, fieldId: string): Promise<void> {
  if (!globalThis.confirm(t('collectors.dataStructure.confirmDeleteField')) || !props.collector.id) return;
  await collectorService.deleteField(props.collector.id, tableId, fieldId);
  await loadStructure();
}

function openCreateIndex(tableId: string): void {
  selectedTableId.value = tableId;
  editingIndex.value = null;
  indexDialogOpen.value = true;
}

function openEditIndex(tableId: string, index: CollectorIndex): void {
  selectedTableId.value = tableId;
  editingIndex.value = index;
  indexDialogOpen.value = true;
}

async function handleIndexSave(payload: Omit<CollectorIndex, 'id'>): Promise<void> {
  if (!props.collector.id || !selectedTableId.value) return;
  const tableId = selectedTableId.value;
  if (editingIndex.value) {
    await collectorService.updateIndex(props.collector.id, tableId, editingIndex.value.id, payload);
  } else {
    await collectorService.createIndex(props.collector.id, tableId, payload);
  }
  indexDialogOpen.value = false;
  editingIndex.value = null;
  await loadStructure();
}

async function deleteIndex(tableId: string, indexId: string): Promise<void> {
  if (!globalThis.confirm(t('collectors.dataStructure.confirmDeleteIndex')) || !props.collector.id) return;
  await collectorService.deleteIndex(props.collector.id, tableId, indexId);
  await loadStructure();
}

async function validateStructure(): Promise<void> {
  if (!props.collector.id) return;
  const result = await collectorService.validateStructure(props.collector.id);
  validationMessage.value = result.valid ? t('collectors.dataStructure.validation.success') : result.errors.join(' ');
  await loadStructure();
}

async function previewChanges(): Promise<void> {
  if (!props.collector.id) return;
  const preview = await collectorService.previewChanges(props.collector.id);
  validationMessage.value = preview.length ? preview.join(' | ') : t('collectors.dataStructure.validation.noChanges');
  await loadStructure();
}

async function applyChanges(): Promise<void> {
  if (!props.collector.id) return;
  const result = await collectorService.applyChanges(props.collector.id);
  validationMessage.value = result.message;
  await loadStructure();
}
</script>

<style scoped>
.collector-db-admin {
  display: grid;
  gap: 16px;
}

.db-splitter {
  min-height: 720px;
  border: 1px solid var(--km-border, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.01);
}

.db-sidebar {
  height: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid var(--km-border, rgba(255, 255, 255, 0.08));
}

.db-sidebar-header {
  margin-bottom: 12px;
}

.db-tree {
  background: transparent;
}

.empty-db-panel,
.db-detail-panel {
  height: 100%;
  padding: 16px;
}

.empty-db-panel {
  display: grid;
  place-items: center;
  text-align: center;
}

.db-status-banner {
  border-radius: 8px;
  background: rgba(76, 175, 80, 0.08);
  color: var(--q-primary);
  padding: 10px 12px;
}

.db-tabs {
  border-bottom: 1px solid var(--km-border, rgba(255, 255, 255, 0.08));
}

.db-table {
  border-radius: 10px;
  overflow: hidden;
}
</style>
