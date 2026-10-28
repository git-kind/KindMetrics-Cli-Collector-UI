<template>
  <div>
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle2">
        {{ t('services.fields.additionalParameters') }}
      </div>
      <q-btn
        flat
        color="primary"
        icon="add"
        :label="t('services.actions.addParameter')"
        @click="addParameter"
      />
    </div>
    <div
      v-if="parameters.length === 0"
      class="text-grey-6"
    >
      {{ t('services.emptyState.parameters') }}
    </div>
    <div
      v-else
      class="row q-col-gutter-md"
    >
      <div
        v-for="(parameter, index) in parameters"
        :key="`${parameter.id}-${index}`"
        class="col-12"
      >
        <q-card
          flat
          bordered
        >
          <q-card-section class="row q-col-gutter-sm items-center">
            <div class="col-12 col-md-3">
              <q-input
                v-model="parameter.key"
                :label="t('services.fields.parameterKey')"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="parameter.type"
                :options="parameterTypes"
                emit-value
                map-options
                :label="t('services.fields.parameterType')"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                :model-value="coerceParamValue(parameter.value)"
                :label="t('services.fields.parameterValue')"
                outlined
                dense
                @update:model-value="parameter.value = $event as string | number | boolean | Record<string, unknown> | null"
              />
            </div>
            <div class="col-12 col-md-2 text-right">
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="removeParameter(index)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceParameter } from 'src/models/services/Service';

const { t } = useI18n();
const props = defineProps<{ parameters: ServiceParameter[] }>();
const emit = defineEmits<{ 'update:parameters': [value: ServiceParameter[]] }>();

const parameterTypes = computed(() => [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
]);

function addParameter(): void {
  const next = [...props.parameters, { id: `${Date.now()}-${Math.random()}`, key: '', value: '', type: 'string' } as ServiceParameter];
  emit('update:parameters', next);
}

function coerceParamValue(value: ServiceParameter['value']): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') return JSON.stringify(value);
  return '';
}

function removeParameter(index: number): void {
  const next = [...props.parameters];
  next.splice(index, 1);
  emit('update:parameters', next);
}
</script>
