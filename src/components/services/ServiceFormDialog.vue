<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card style="min-width: min(1000px, 90vw); max-width: 1100px;">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          {{ editing ? t('services.actions.edit') : t('services.actions.create') }}
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="emit('update:modelValue', false)"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <q-tabs
          v-model="tab"
          align="left"
          class="q-mb-md"
        >
          <q-tab
            name="general"
            :label="t('services.sections.general')"
          />
          <q-tab
            name="connection"
            :label="t('services.sections.connection')"
          />
          <q-tab
            name="auth"
            :label="t('services.sections.authentication')"
          />
          <q-tab
            name="algorithms"
            :label="t('services.sections.algorithms')"
          />
          <q-tab
            name="parameters"
            :label="t('services.sections.additionalParameters')"
          />
        </q-tabs>

        <q-tab-panels v-model="tab">
          <q-tab-panel name="general">
            <ServiceGeneralComponent
              :draft="draft"
              :types="serviceTypes"
              :loading-types="loadingTypes"
              @update:draft="onUpdateDraft"
            />
          </q-tab-panel>
          <q-tab-panel name="connection">
            <ServiceConnectionComponent :draft="draft" />
          </q-tab-panel>
          <q-tab-panel name="auth">
            <ServiceAuthenticationComponent
              :draft="draft"
              @update:draft="onUpdateDraft"
            />
          </q-tab-panel>
          <q-tab-panel name="algorithms">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <ServiceAuthAlgorithmComponent />
              </div>
              <div class="col-12 col-md-6">
                <ServiceEncryptionComponent />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="parameters">
            <ServiceAdditionalParametersComponent
              :parameters="draft.additionalParameters"
              @update:parameters="onUpdateParameters"
            />
          </q-tab-panel>
        </q-tab-panels>

        <q-banner
          v-if="errorMessage"
          rounded
          class="bg-negative text-white q-mt-md"
        >
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="t('common.cancel')"
          @click="emit('update:modelValue', false)"
        />
        <q-btn
          color="primary"
          :loading="saving"
          :label="t('common.save')"
          @click="emit('save')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceFormDraft, ServiceParameter, ServiceTypeCatalogItem } from 'src/models/services/Service';
import ServiceGeneralComponent from './ServiceGeneralComponent.vue';
import ServiceConnectionComponent from './ServiceConnectionComponent.vue';
import ServiceAuthenticationComponent from './ServiceAuthenticationComponent.vue';
import ServiceAuthAlgorithmComponent from './ServiceAuthAlgorithmComponent.vue';
import ServiceEncryptionComponent from './ServiceEncryptionComponent.vue';
import ServiceAdditionalParametersComponent from './ServiceAdditionalParametersComponent.vue';

const { t } = useI18n();
const props = defineProps<{
  modelValue: boolean;
  draft: ServiceFormDraft;
  serviceTypes: ServiceTypeCatalogItem[];
  loadingTypes: boolean;
  editing: boolean;
  saving: boolean;
  errorMessage?: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; save: []; 'update:draft': [value: ServiceFormDraft] }>();
const tab = ref('general');

function onUpdateDraft(draft: ServiceFormDraft): void {
  emit('update:draft', draft);
}

function onUpdateParameters(parameters: ServiceParameter[]): void {
  const next = { ...props.draft, additionalParameters: parameters };
  emit('update:draft', next);
}
</script>
