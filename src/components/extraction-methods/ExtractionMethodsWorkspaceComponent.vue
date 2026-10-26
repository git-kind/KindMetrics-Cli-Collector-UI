<template>
  <div class="extraction-workspace">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        {{ t('extractionMethods.title') }}
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        :label="t('extractionMethods.actions.create')"
        @click="openCreate"
      />
    </div>

    <ExtractionMethodFiltersComponent
      v-model="filters"
      :protocols="protocols"
      class="q-mb-md"
    />

    <q-banner
      v-if="pageError"
      rounded
      class="bg-negative text-white q-mb-md"
    >
      {{ pageErrorMessage }}
      <template #action>
        <q-btn
          flat
          color="white"
          :label="t('common.retry')"
          @click="loadMethods"
        />
      </template>
    </q-banner>

    <div class="method-layout">
      <ExtractionMethodListComponent
        :methods="filteredMethods"
        :loading="loading"
        @select="selectedId = $event"
        @edit="openEdit"
        @duplicate="duplicateMethod"
        @toggle-active="toggleActive"
        @delete="confirmDelete"
      />
      <ExtractionMethodDetailComponent :method="selected" />
    </div>

    <ExtractionMethodFormDialogComponent
      v-model="dialogOpen"
      :editing="editing"
      :saving="saving"
      :error-message="formError"
      :draft="draft"
      @update:draft="draft = $event"
      @save="saveMethod"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import ExtractionMethodDetailComponent from './ExtractionMethodDetailComponent.vue';
import ExtractionMethodFiltersComponent, { type ExtractionMethodFilters } from './ExtractionMethodFiltersComponent.vue';
import ExtractionMethodFormDialogComponent from './ExtractionMethodFormDialogComponent.vue';
import ExtractionMethodListComponent from './ExtractionMethodListComponent.vue';
import type { ExtractionMethod, ExtractionMethodInput } from 'src/models/extraction-method';
import { extractionMethodService } from 'src/services/extraction-method.service';

const { t } = useI18n();
const $q = useQuasar();
const methods = ref<ExtractionMethod[]>([]);
const selectedId = ref('');
const filters = ref<ExtractionMethodFilters>({ search: '', protocol: '', status: '' });
const protocols = extractionMethodService.getProtocolOptions();
const loading = ref(false);
const pageError = ref(false);
const pageErrorMessage = ref('');
const saving = ref(false);
const dialogOpen = ref(false);
const editing = ref(false);
const editingId = ref<string | null>(null);
const formError = ref('');
const draft = ref<ExtractionMethodInput>(emptyDraft());
const cloneJson = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value;

const filteredMethods = computed(() => methods.value.filter((method) =>
  `${method.code} ${method.name} ${method.protocol}`.toLowerCase().includes(filters.value.search.trim().toLowerCase())
  && (!filters.value.protocol || method.protocol === filters.value.protocol)
  && (!filters.value.status || method.isActive === (filters.value.status === 'ACTIVE')),
));
const selected = computed(() => methods.value.find((method) => method.id === selectedId.value) ?? null);

onMounted(() => void loadMethods());

function emptyDraft(): ExtractionMethodInput {
  return {
    code: '',
    name: '',
    description: null,
    protocol: 'HTTP',
    configurationSchema: null,
    isActive: true,
    parameters: [],
    requests: [],
  };
}

function inputFromMethod(method: ExtractionMethod): ExtractionMethodInput {
  return {
    code: method.code,
    name: method.name,
    description: method.description,
    protocol: method.protocol,
    configurationSchema: method.configurationSchema ? cloneJson(method.configurationSchema) : null,
    isActive: method.isActive,
    parameters: method.parameters.map(({ parameterKey, dataType, defaultValue, isRequired, isSecret, description }) => ({
      parameterKey, dataType, defaultValue, isRequired, isSecret, description,
    })),
    requests: method.requests.map(({ code, name, requestType, requestConfig, isActive, fields }) => ({
      code,
      name,
      requestType,
      requestConfig: cloneJson(requestConfig),
      isActive,
      fields: fields.map(({ fieldKey, sourcePath, dataType, unit, description }) => ({
        fieldKey, sourcePath, dataType, unit, description,
      })),
    })),
  };
}

async function loadMethods(): Promise<void> {
  loading.value = true;
  pageError.value = false;
  pageErrorMessage.value = '';
  try {
    methods.value = await extractionMethodService.listMethods();
    if (!methods.value.some((method) => method.id === selectedId.value)) selectedId.value = methods.value[0]?.id ?? '';
  } catch (error) {
    pageError.value = true;
    pageErrorMessage.value = error instanceof Error ? error.message : t('extractionMethods.errors.load');
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = false;
  editingId.value = null;
  formError.value = '';
  draft.value = emptyDraft();
  dialogOpen.value = true;
}

function openEdit(method: ExtractionMethod): void {
  editing.value = true;
  editingId.value = method.id;
  formError.value = '';
  draft.value = inputFromMethod(method);
  selectedId.value = method.id;
  dialogOpen.value = true;
}

async function duplicateMethod(method: ExtractionMethod): Promise<void> {
  const draftCopy = inputFromMethod(method);
  const baseCode = `${method.code}_COPY`;
  let copyCode = baseCode;
  let suffix = 2;
  while (methods.value.some((item) => item.code.toLowerCase() === copyCode.toLowerCase())) {
    copyCode = `${baseCode}_${suffix++}`;
  }
  draftCopy.code = copyCode;
  draftCopy.name = `${method.name} (${t('extractionMethods.actions.copySuffix')})`;

  try {
    const result = await extractionMethodService.createMethod(draftCopy);
    if (!result.success) {
      $q.notify({ type: 'negative', message: t('extractionMethods.errors.duplicate') });
      return;
    }
    await loadMethods();
    selectedId.value = result.method.id;
    $q.notify({ type: 'positive', message: t('extractionMethods.messages.duplicated') });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('extractionMethods.errors.duplicate'),
    });
  }
}

async function toggleActive(method: ExtractionMethod): Promise<void> {
  try {
    const result = await extractionMethodService.updateMethod(method.id, {
      ...inputFromMethod(method),
      isActive: !method.isActive,
    });
    if (!result.success) {
      $q.notify({ type: 'negative', message: t('extractionMethods.errors.save') });
      return;
    }
    await loadMethods();
    selectedId.value = result.method.id;
    $q.notify({
      type: 'positive',
      message: t(result.method.isActive ? 'extractionMethods.messages.activated' : 'extractionMethods.messages.deactivated'),
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('extractionMethods.errors.save'),
    });
  }
}

async function saveMethod(): Promise<void> {
  saving.value = true;
  formError.value = '';
  try {
    const result = editing.value && editingId.value
      ? await extractionMethodService.updateMethod(editingId.value, draft.value)
      : await extractionMethodService.createMethod(draft.value);
    if (!result.success) {
      formError.value = result.reason === 'duplicate'
        ? 'extractionMethods.validation.duplicateCode'
        : result.reason === 'duplicate-nested'
          ? 'extractionMethods.validation.duplicateNestedCode'
        : result.reason === 'not-found'
          ? 'extractionMethods.errors.notFound'
          : 'extractionMethods.validation.requiredNested';
      return;
    }
    dialogOpen.value = false;
    await loadMethods();
    selectedId.value = result.method.id;
  } catch (error) {
    formError.value = error instanceof Error ? error.message : t('extractionMethods.errors.save');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(method: ExtractionMethod): void {
  $q.dialog({
    title: t('extractionMethods.confirm.deleteTitle'),
    message: t('extractionMethods.confirm.deleteMessage', { name: method.name }),
    cancel: { label: t('common.cancel'), flat: true },
    ok: { label: t('common.delete'), color: 'negative' },
    persistent: true,
  }).onOk(() => void deleteMethod(method));
}

async function deleteMethod(method: ExtractionMethod): Promise<void> {
  try {
    const deleted = await extractionMethodService.deleteMethod(method.id);
    if (!deleted) {
      $q.notify({ type: 'negative', message: t('extractionMethods.errors.delete') });
      return;
    }
    if (selectedId.value === method.id) selectedId.value = '';
    await loadMethods();
    $q.notify({ type: 'positive', message: t('extractionMethods.messages.deleted') });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('extractionMethods.errors.delete'),
    });
  }
}
</script>

<style scoped>
.method-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.4fr);
  gap: 16px;
  align-items: start;
}
@media (max-width: 800px) {
  .method-layout { grid-template-columns: 1fr; }
}
</style>