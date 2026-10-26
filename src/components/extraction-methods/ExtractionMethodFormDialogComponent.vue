<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="method-form">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ t(editing ? 'extractionMethods.actions.edit' : 'extractionMethods.actions.create') }}
        </div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          :aria-label="t('common.cancel')"
          @click="emit('update:modelValue', false)"
        />
      </q-card-section>
      <q-separator />
      <q-form @submit.prevent="submit">
        <q-card-section class="q-gutter-md form-scroll">
          <div class="form-grid">
            <q-input
              :model-value="draft.code"
              outlined
              :label="t('extractionMethods.fields.code')"
              :rules="[requiredRule]"
              @update:model-value="updateRoot('code', String($event ?? ''))"
            />
            <q-input
              :model-value="draft.name"
              outlined
              :label="t('extractionMethods.fields.name')"
              :rules="[requiredRule]"
              @update:model-value="updateRoot('name', String($event ?? ''))"
            />
            <q-select
              :model-value="draft.protocol"
              outlined
              use-input
              new-value-mode="add-unique"
              :options="protocolOptions"
              :label="t('extractionMethods.fields.protocol')"
              :rules="[requiredRule]"
              @update:model-value="updateProtocol(String($event ?? ''))"
            />
            <q-toggle
              :model-value="draft.isActive"
              :label="t('common.active')"
              @update:model-value="updateRoot('isActive', $event)"
            />
          </div>
          <q-input
            :model-value="draft.description ?? ''"
            outlined
            type="textarea"
            autogrow
            :label="t('extractionMethods.fields.description')"
            @update:model-value="updateRoot('description', String($event ?? '') || null)"
          />
          <q-input
            :model-value="schemaText"
            outlined
            type="textarea"
            autogrow
            :label="t('extractionMethods.sections.configurationSchema')"
            :error="schemaInvalid"
            :error-message="schemaInvalid ? t('extractionMethods.validation.invalidJson') : undefined"
            @update:model-value="updateSchema(String($event ?? ''))"
          />

          <q-separator />
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">
              {{ t('extractionMethods.sections.parameters') }}
            </div>
            <q-btn
              flat
              color="primary"
              icon="add"
              :label="t('extractionMethods.actions.addParameter')"
              @click="addParameter"
            />
          </div>
          <q-card
            v-for="(parameter, index) in draft.parameters"
            :key="`parameter-${index}`"
            flat
            bordered
            class="nested-editor"
          >
            <q-card-section class="row items-center q-pb-none">
              <div class="text-subtitle2">
                {{ parameter.parameterKey || t('extractionMethods.actions.newParameter') }}
              </div>
              <q-space />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                :aria-label="t('common.delete')"
                @click="removeParameter(index)"
              />
            </q-card-section>
            <q-card-section class="form-grid">
              <q-input
                :model-value="parameter.parameterKey"
                outlined
                :label="t('extractionMethods.fields.parameterKey')"
                :rules="[requiredRule]"
                @update:model-value="updateParameter(index, 'parameterKey', String($event ?? ''))"
              />
              <q-select
                :model-value="parameter.dataType"
                outlined
                emit-value
                map-options
                :options="dataTypeOptions"
                :label="t('extractionMethods.fields.dataType')"
                @update:model-value="updateParameter(index, 'dataType', String($event ?? 'STRING'))"
              />
              <q-input
                :model-value="parameter.defaultValue ?? ''"
                outlined
                :label="t('extractionMethods.fields.defaultValue')"
                @update:model-value="updateParameter(index, 'defaultValue', String($event ?? '') || null)"
              />
              <div class="row items-center">
                <q-toggle
                  :model-value="parameter.isRequired"
                  :label="t('extractionMethods.fields.required')"
                  @update:model-value="updateParameter(index, 'isRequired', $event)"
                />
                <q-toggle
                  :model-value="parameter.isSecret"
                  :label="t('extractionMethods.fields.secret')"
                  @update:model-value="updateParameter(index, 'isSecret', $event)"
                />
              </div>
              <q-input
                class="span-all"
                :model-value="parameter.description ?? ''"
                outlined
                :label="t('extractionMethods.fields.description')"
                @update:model-value="updateParameter(index, 'description', String($event ?? '') || null)"
              />
            </q-card-section>
          </q-card>
          <div
            v-if="draft.parameters.length === 0"
            class="km-muted"
          >
            {{ t('extractionMethods.emptyParameters') }}
          </div>

          <q-separator />
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">
              {{ t('extractionMethods.sections.requests') }}
            </div>
            <q-btn
              flat
              color="primary"
              icon="add"
              :label="t('extractionMethods.actions.addRequest')"
              @click="addRequest"
            />
          </div>
          <q-card
            v-for="(request, requestIndex) in draft.requests"
            :key="`request-${requestIndex}`"
            flat
            bordered
            class="nested-editor"
          >
            <q-card-section class="row items-center q-pb-none">
              <div class="text-subtitle2">
                {{ request.code || t('extractionMethods.actions.newRequest') }}
              </div>
              <q-space />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                :aria-label="t('common.delete')"
                @click="removeRequest(requestIndex)"
              />
            </q-card-section>
            <q-card-section class="q-gutter-md">
              <div class="form-grid">
                <q-input
                  :model-value="request.code"
                  outlined
                  :label="t('extractionMethods.fields.requestCode')"
                  :rules="[requiredRule]"
                  @update:model-value="updateRequest(requestIndex, 'code', String($event ?? ''))"
                />
                <q-input
                  :model-value="request.name"
                  outlined
                  :label="t('extractionMethods.fields.requestName')"
                  :rules="[requiredRule]"
                  @update:model-value="updateRequest(requestIndex, 'name', String($event ?? ''))"
                />
                <q-select
                  :model-value="request.requestType"
                  outlined
                  emit-value
                  map-options
                  :options="requestTypeOptionsForProtocol(draft.protocol)"
                  :label="t('extractionMethods.fields.requestType')"
                  @update:model-value="updateRequest(requestIndex, 'requestType', String($event ?? 'HTTP'))"
                />
                <q-toggle
                  :model-value="request.isActive"
                  :label="t('common.active')"
                  @update:model-value="updateRequest(requestIndex, 'isActive', $event)"
                />
              </div>
              <q-input
                :model-value="requestConfigText(request.requestConfig)"
                outlined
                type="textarea"
                autogrow
                :label="t('extractionMethods.fields.requestConfig')"
                :error="invalidRequestConfigIndex === requestIndex"
                :error-message="invalidRequestConfigIndex === requestIndex ? t('extractionMethods.validation.invalidJson') : undefined"
                @update:model-value="updateRequestConfig(requestIndex, String($event ?? ''))"
              />
              <div class="row items-center justify-between">
                <div class="text-body2 text-weight-medium">
                  {{ t('extractionMethods.sections.fields') }}
                </div>
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="add"
                  :label="t('extractionMethods.actions.addField')"
                  @click="addField(requestIndex)"
                />
              </div>
              <div
                v-for="(field, fieldIndex) in request.fields"
                :key="`field-${requestIndex}-${fieldIndex}`"
                class="field-editor"
              >
                <q-input
                  :model-value="field.fieldKey"
                  outlined
                  dense
                  :label="t('extractionMethods.fields.fieldKey')"
                  @update:model-value="updateField(requestIndex, fieldIndex, 'fieldKey', String($event ?? ''))"
                />
                <q-input
                  :model-value="field.sourcePath"
                  outlined
                  dense
                  :label="t('extractionMethods.fields.sourcePath')"
                  @update:model-value="updateField(requestIndex, fieldIndex, 'sourcePath', String($event ?? ''))"
                />
                <q-select
                  :model-value="field.dataType"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="dataTypeOptions"
                  :label="t('extractionMethods.fields.dataType')"
                  @update:model-value="updateField(requestIndex, fieldIndex, 'dataType', String($event ?? 'STRING'))"
                />
                <q-input
                  :model-value="field.unit ?? ''"
                  outlined
                  dense
                  :label="t('extractionMethods.fields.unit')"
                  @update:model-value="updateField(requestIndex, fieldIndex, 'unit', String($event ?? '') || null)"
                />
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  :aria-label="t('common.delete')"
                  @click="removeField(requestIndex, fieldIndex)"
                />
              </div>
              <q-input
                v-for="(field, fieldIndex) in request.fields"
                :key="`field-description-${requestIndex}-${fieldIndex}`"
                :model-value="field.description ?? ''"
                outlined
                dense
                :label="`${t('extractionMethods.fields.description')}: ${field.fieldKey || fieldIndex + 1}`"
                @update:model-value="updateField(requestIndex, fieldIndex, 'description', String($event ?? '') || null)"
              />
            </q-card-section>
          </q-card>
          <div
            v-if="draft.requests.length === 0"
            class="km-muted"
          >
            {{ t('extractionMethods.emptyRequests') }}
          </div>

          <q-banner
            v-if="errorMessage || validationError"
            rounded
            class="feedback-error"
          >
            {{ t(errorMessage || validationError) }}
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
            @click="emit('update:modelValue', false)"
          />
          <q-btn
            color="primary"
            unelevated
            type="submit"
            :loading="saving"
            :label="t('common.save')"
            icon="save"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  ExtractionMethodFieldInput,
  ExtractionMethodInput,
  ExtractionMethodParameterInput,
  ExtractionMethodRequestInput,
} from 'src/models/extraction-method';

const props = defineProps<{
  modelValue: boolean;
  editing: boolean;
  saving: boolean;
  errorMessage: string;
  draft: ExtractionMethodInput;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:draft': [value: ExtractionMethodInput];
  save: [];
}>();

const { t } = useI18n();
const schemaText = ref('');
const schemaInvalid = ref(false);
const invalidRequestConfigIndex = ref(-1);
const validationError = ref('');
const protocolOptions = ['SNMP', 'API', 'REST', 'MICROSOFT_GRAPH', 'WEBHOOK', 'SOAP', 'SSH', 'SQL'];
const requestTypesByProtocol: Record<string, string[]> = {
  SNMP: ['GET', 'GETNEXT', 'WALK', 'GETBULK'],
  API: ['HTTP'],
  REST: ['HTTP'],
  MICROSOFT_GRAPH: ['GRAPH'],
  WEBHOOK: ['WEBHOOK'],
  SOAP: ['SOAP'],
  SSH: ['SSH'],
  SQL: ['SQL'],
};
const dataTypeOptions = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATETIME'].map((value) => ({ label: value, value }));
const requiredRule = (value: string) => !!value?.trim() || t('common.required');

watch(() => props.draft.configurationSchema, (schema) => {
  schemaText.value = schema ? JSON.stringify(schema, null, 2) : '';
}, { immediate: true });

function updateRoot<Key extends keyof ExtractionMethodInput>(key: Key, value: ExtractionMethodInput[Key]): void {
  emit('update:draft', { ...props.draft, [key]: value });
}

function updateProtocol(protocol: string): void {
  const allowedRequestTypes = requestTypesByProtocol[protocol] ?? [protocol];
  const defaultRequestType = allowedRequestTypes[0] ?? protocol;
  emit('update:draft', {
    ...props.draft,
    protocol,
    requests: props.draft.requests.map((request) => ({
      ...request,
      requestType: allowedRequestTypes.includes(request.requestType) ? request.requestType : defaultRequestType,
    })),
  });
}

function requestTypeOptionsForProtocol(protocol: string) {
  return (requestTypesByProtocol[protocol] ?? [protocol || 'HTTP']).map((value) => ({ label: value, value }));
}

function updateSchema(text: string): void {
  schemaText.value = text;
  if (!text.trim()) {
    schemaInvalid.value = false;
    updateRoot('configurationSchema', null);
    return;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object');
    schemaInvalid.value = false;
    updateRoot('configurationSchema', parsed as Record<string, unknown>);
  } catch {
    schemaInvalid.value = true;
  }
}

function addParameter(): void {
  const parameter: ExtractionMethodParameterInput = {
    parameterKey: '', dataType: 'STRING', defaultValue: null, isRequired: false, isSecret: false, description: null,
  };
  updateRoot('parameters', [...props.draft.parameters, parameter]);
}

function removeParameter(index: number): void {
  updateRoot('parameters', props.draft.parameters.filter((_, itemIndex) => itemIndex !== index));
}

function updateParameter<Key extends keyof ExtractionMethodParameterInput>(index: number, key: Key, value: ExtractionMethodParameterInput[Key]): void {
  updateRoot('parameters', props.draft.parameters.map((parameter, itemIndex) => itemIndex === index ? { ...parameter, [key]: value } : parameter));
}

function addRequest(): void {
  const requestType = requestTypesByProtocol[props.draft.protocol]?.[0] ?? (props.draft.protocol || 'HTTP');
  const request: ExtractionMethodRequestInput = {
    code: '', name: '', requestType, requestConfig: {}, isActive: true, fields: [],
  };
  updateRoot('requests', [...props.draft.requests, request]);
}

function removeRequest(index: number): void {
  updateRoot('requests', props.draft.requests.filter((_, itemIndex) => itemIndex !== index));
  invalidRequestConfigIndex.value = -1;
}

function updateRequest<Key extends keyof ExtractionMethodRequestInput>(index: number, key: Key, value: ExtractionMethodRequestInput[Key]): void {
  updateRoot('requests', props.draft.requests.map((request, itemIndex) => itemIndex === index ? { ...request, [key]: value } : request));
}

function requestConfigText(config: Record<string, unknown>): string {
  return JSON.stringify(config, null, 2);
}

function updateRequestConfig(index: number, text: string): void {
  if (!text.trim()) {
    invalidRequestConfigIndex.value = -1;
    updateRequest(index, 'requestConfig', {});
    return;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object');
    invalidRequestConfigIndex.value = -1;
    updateRequest(index, 'requestConfig', parsed as Record<string, unknown>);
  } catch {
    invalidRequestConfigIndex.value = index;
  }
}

function addField(requestIndex: number): void {
  const field: ExtractionMethodFieldInput = {
    fieldKey: '', sourcePath: '', dataType: 'STRING', unit: null, description: null,
  };
  updateRequest(requestIndex, 'fields', [...props.draft.requests[requestIndex]!.fields, field]);
}

function removeField(requestIndex: number, fieldIndex: number): void {
  const request = props.draft.requests[requestIndex];
  if (!request) return;
  updateRequest(requestIndex, 'fields', request.fields.filter((_, index) => index !== fieldIndex));
}

function updateField<Key extends keyof ExtractionMethodFieldInput>(
  requestIndex: number,
  fieldIndex: number,
  key: Key,
  value: ExtractionMethodFieldInput[Key],
): void {
  const request = props.draft.requests[requestIndex];
  if (!request) return;
  const fields = request.fields.map((field, index) => index === fieldIndex ? { ...field, [key]: value } : field);
  updateRequest(requestIndex, 'fields', fields);
}

function submit(): void {
  validationError.value = '';
  if (schemaInvalid.value || invalidRequestConfigIndex.value >= 0) {
    validationError.value = 'extractionMethods.validation.invalidJson';
    return;
  }
  if (props.draft.parameters.some((parameter) => !parameter.parameterKey.trim())
    || props.draft.requests.some((request) => !request.code.trim() || !request.name.trim()
      || request.fields.some((field) => !field.fieldKey.trim() || !field.sourcePath.trim()))) {
    validationError.value = 'extractionMethods.validation.requiredNested';
    return;
  }
  emit('save');
}
</script>

<style scoped>
.method-form {
  width: min(760px, calc(100vw - 32px));
  max-width: 760px;
}

.form-scroll {
  max-height: min(70vh, 720px);
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.span-all {
  grid-column: 1 / -1;
}

.nested-editor {
  border-radius: 4px;
}

.field-editor {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(80px, 0.6fr) 40px;
  gap: 8px;
  align-items: start;
  margin-bottom: 8px;
}

.feedback-error {
  background: #fbefed;
  color: #8e3025;
}

@media (max-width: 650px) {
  .form-grid,
  .field-editor {
    grid-template-columns: 1fr;
  }

  .span-all {
    grid-column: auto;
  }
}
</style>