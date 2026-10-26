<template>
  <section class="equipment-bindings">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1 text-weight-medium">
        {{ t('extractionMethods.sections.equipmentBindings') }}
      </div>
      <q-btn
        color="primary"
        flat
        icon="add"
        :label="t('extractionMethods.actions.addEquipmentBinding')"
        @click="openCreate"
      />
    </div>

    <q-banner
      v-if="loadError"
      rounded
      class="bg-negative text-white q-mb-sm"
    >
      {{ t('extractionMethods.errors.loadEquipmentBindings') }}
      <template #action>
        <q-btn
          flat
          color="white"
          :label="t('common.retry')"
          @click="loadBindings"
        />
      </template>
    </q-banner>

    <q-list
      bordered
      separator
    >
      <q-item
        v-for="binding in bindings"
        :key="binding.id"
      >
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ binding.name }}
          </q-item-label>
          <q-item-label caption>
            {{ t('extractionMethods.fields.equipmentId') }}: {{ binding.equipmentId }}
            <span v-if="binding.credentialRef"> · {{ t('extractionMethods.fields.credentialRef') }}: {{ binding.credentialRef }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row no-wrap items-center">
            <q-badge
              :color="binding.isActive ? 'positive' : 'grey-7'"
              :label="t(binding.isActive ? 'common.active' : 'common.inactive')"
              class="q-mr-sm"
            />
            <q-btn
              flat
              round
              dense
              icon="edit"
              :aria-label="t('common.edit')"
              @click="openEdit(binding)"
            />
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :aria-label="t('common.delete')"
              @click="confirmDelete(binding)"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="!loading && bindings.length === 0">
        <q-item-section class="km-muted">
          {{ t('extractionMethods.emptyEquipmentBindings') }}
        </q-item-section>
      </q-item>
      <q-item v-if="loading">
        <q-item-section><q-spinner color="primary" /></q-item-section>
      </q-item>
    </q-list>

    <q-dialog
      v-model="dialogOpen"
      persistent
    >
      <q-card class="binding-form">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ t(editingId ? 'extractionMethods.actions.editEquipmentBinding' : 'extractionMethods.actions.addEquipmentBinding') }}
          </div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('common.cancel')"
            @click="dialogOpen = false"
          />
        </q-card-section>
        <q-separator />
        <q-form @submit.prevent="saveBinding">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="draft.equipmentId"
              outlined
              :label="t('extractionMethods.fields.equipmentId')"
              :rules="[requiredRule]"
            />
            <q-input
              v-model="draft.name"
              outlined
              :label="t('extractionMethods.fields.bindingName')"
              :rules="[requiredRule]"
            />
            <q-input
              v-model="draft.credentialRef"
              outlined
              :label="t('extractionMethods.fields.credentialRef')"
            />
            <q-input
              v-model="connectionConfigText"
              outlined
              type="textarea"
              autogrow
              :label="t('extractionMethods.fields.connectionConfig')"
              :error="jsonError"
              :error-message="jsonError ? t('extractionMethods.validation.invalidJson') : undefined"
              @update:model-value="parseConnectionConfig"
            />
            <q-toggle
              v-model="draft.isActive"
              :label="t('common.active')"
            />
            <q-banner
              v-if="formError"
              rounded
              class="bg-negative text-white"
            >
              {{ formError }}
            </q-banner>
          </q-card-section>
          <q-separator />
          <q-card-actions
            align="right"
            class="q-pa-md"
          >
            <q-btn
              flat
              :label="t('common.cancel')"
              @click="dialogOpen = false"
            />
            <q-btn
              color="primary"
              unelevated
              type="submit"
              :loading="saving"
              :label="t('common.save')"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { EquipmentExtractionMethod, EquipmentExtractionMethodInput } from 'src/models/extraction-method';
import { extractionMethodService } from 'src/services/extraction-method.service';

const props = defineProps<{ methodId: string }>();
const { t } = useI18n();
const $q = useQuasar();
const bindings = ref<EquipmentExtractionMethod[]>([]);
const loading = ref(false);
const loadError = ref(false);
const saving = ref(false);
const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const formError = ref('');
const jsonError = ref(false);
const connectionConfigText = ref('');
const draft = reactive<EquipmentExtractionMethodInput>({
  equipmentId: '',
  name: '',
  connectionConfig: null,
  credentialRef: null,
  isActive: true,
});
const requiredRule = (value: string) => !!value?.trim() || t('common.required');

onMounted(() => void loadBindings());
watch(() => props.methodId, () => void loadBindings());

async function loadBindings(): Promise<void> {
  loading.value = true;
  loadError.value = false;
  try {
    bindings.value = await extractionMethodService.listEquipmentBindings(props.methodId);
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editingId.value = null;
  Object.assign(draft, { equipmentId: '', name: '', connectionConfig: null, credentialRef: null, isActive: true });
  connectionConfigText.value = '';
  formError.value = '';
  jsonError.value = false;
  dialogOpen.value = true;
}

function openEdit(binding: EquipmentExtractionMethod): void {
  editingId.value = binding.id;
  Object.assign(draft, {
    equipmentId: binding.equipmentId,
    name: binding.name,
    connectionConfig: binding.connectionConfig ? { ...binding.connectionConfig } : null,
    credentialRef: binding.credentialRef,
    isActive: binding.isActive,
  });
  connectionConfigText.value = binding.connectionConfig ? JSON.stringify(binding.connectionConfig, null, 2) : '';
  formError.value = '';
  jsonError.value = false;
  dialogOpen.value = true;
}

function parseConnectionConfig(value: string | number | null): void {
  connectionConfigText.value = String(value ?? '');
  if (!connectionConfigText.value.trim()) {
    draft.connectionConfig = null;
    jsonError.value = false;
    return;
  }
  try {
    const parsed: unknown = JSON.parse(connectionConfigText.value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object');
    draft.connectionConfig = parsed as Record<string, unknown>;
    jsonError.value = false;
  } catch {
    jsonError.value = true;
  }
}

async function saveBinding(): Promise<void> {
  if (jsonError.value) return;
  saving.value = true;
  formError.value = '';
  try {
    const result = editingId.value
      ? await extractionMethodService.updateEquipmentBinding(props.methodId, editingId.value, { ...draft })
      : await extractionMethodService.createEquipmentBinding(props.methodId, { ...draft });
    if (!result) {
      formError.value = t('extractionMethods.validation.duplicateEquipmentBinding');
      return;
    }
    dialogOpen.value = false;
    await loadBindings();
  } catch (error) {
    formError.value = error instanceof Error ? error.message : t('extractionMethods.errors.saveEquipmentBinding');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(binding: EquipmentExtractionMethod): void {
  $q.dialog({
    title: t('extractionMethods.confirm.deleteBindingTitle'),
    message: t('extractionMethods.confirm.deleteBindingMessage', { name: binding.name }),
    cancel: { label: t('common.cancel'), flat: true },
    ok: { label: t('common.delete'), color: 'negative' },
    persistent: true,
  }).onOk(() => void deleteBinding(binding));
}

async function deleteBinding(binding: EquipmentExtractionMethod): Promise<void> {
  try {
    const deleted = await extractionMethodService.deleteEquipmentBinding(props.methodId, binding.id);
    if (!deleted) throw new Error(t('extractionMethods.errors.deleteEquipmentBinding'));
    await loadBindings();
  } catch (error) {
    $q.notify({ type: 'negative', message: error instanceof Error ? error.message : t('extractionMethods.errors.deleteEquipmentBinding') });
  }
}
</script>

<style scoped>
.binding-form {
  width: min(620px, calc(100vw - 32px));
  max-width: 620px;
}
</style>