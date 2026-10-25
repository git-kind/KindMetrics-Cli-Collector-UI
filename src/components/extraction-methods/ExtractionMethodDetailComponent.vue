<template>
  <q-card v-if="method" flat bordered class="method-detail">
    <q-card-section class="row items-center">
      <div>
        <div class="text-h6">{{ methodTypeLabel(method.type) }} - {{ method.name }}</div>
        <div class="km-muted">{{ method.description || t('common.notAvailable') }}</div>
      </div>
      <q-space />
      <q-badge :color="method.status === 'ACTIVE' ? 'positive' : 'grey-7'" :label="t(`collectors.status.${method.status.toLowerCase()}`)" />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.connection') }}</div>
      <q-list dense separator>
        <q-item v-for="[key, value] in Object.entries(method.connection)" :key="key">
          <q-item-section>{{ connectionFieldLabel(key) }}</q-item-section>
          <q-item-section side>{{ String(value) }}</q-item-section>
        </q-item>
      </q-list>
      <div class="row q-gutter-sm q-mt-md">
        <q-btn
          outline
          color="primary"
          :icon="method.type === 'MICROSOFT_GRAPH' ? 'verified_user' : 'cable'"
          :loading="testing"
          :label="t(method.type === 'MICROSOFT_GRAPH' ? 'extractionMethods.actions.testAuthentication' : method.type === 'WEBHOOK' ? 'extractionMethods.actions.testConfiguration' : 'extractionMethods.actions.testConnection')"
          @click="emit('test')"
        />
        <q-btn color="primary" unelevated icon="travel_explore" :loading="discovering" :label="t('extractionMethods.actions.runDiscovery')" @click="emit('discover')" />
        <q-btn v-if="method.type === 'WEBHOOK'" flat color="secondary" icon="data_object" :label="t('extractionMethods.actions.showPayload')" @click="emit('show-payload')" />
      </div>
      <q-banner v-if="feedbackKey" rounded class="q-mt-md" :class="feedbackSuccess ? 'feedback-success' : 'feedback-error'">
        {{ t(feedbackKey) }}
      </q-banner>
    </q-card-section>

    <template v-if="method.discovery.device">
      <q-separator />
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.device') }}</div>
        <div class="detail-grid">
          <div v-for="[key, value] in Object.entries(method.discovery.device)" :key="key">
            <span>{{ connectionFieldLabel(key) }}</span><strong>{{ value }}</strong>
          </div>
        </div>
      </q-card-section>
    </template>

    <template v-if="method.discovery.resources.length">
      <q-separator />
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.resources') }}</div>
        <div class="row q-gutter-sm">
          <q-chip v-for="resource in method.discovery.resources" :key="resource" square>{{ resource }}</q-chip>
        </div>
      </q-card-section>
    </template>

    <q-separator />
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('extractionMethods.sections.availableData') }}</div>
      <q-list dense separator>
        <q-item v-for="item in method.availableData" :key="item.id">
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
            <q-item-label caption>{{ item.description }} · {{ methodTypeLabel(item.source as ExtractionMethodType) }}</q-item-label>
          </q-item-section>
          <q-item-section side><q-badge color="positive" :label="t('extractionMethods.dataStatus.available')" /></q-item-section>
        </q-item>
        <q-item v-if="method.availableData.length === 0"><q-item-section class="km-muted">{{ t('extractionMethods.noDiscoveredData') }}</q-item-section></q-item>
      </q-list>
    </q-card-section>
  </q-card>
  <q-card v-else flat bordered class="method-detail empty-detail row items-center justify-center">
    <div class="km-muted">{{ t('extractionMethods.selectPrompt') }}</div>
  </q-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ExtractionMethod, ExtractionMethodType } from 'src/models/extraction-method';

defineProps<{
  method: ExtractionMethod | null;
  testing: boolean;
  discovering: boolean;
  feedbackKey: string;
  feedbackSuccess: boolean;
  methodTypeLabel: (type: ExtractionMethodType) => string;
  connectionFieldLabel: (key: string) => string;
}>();

const emit = defineEmits<{
  test: [];
  discover: [];
  'show-payload': [];
}>();
const { t } = useI18n();
</script>

<style scoped>
.method-detail {
  min-width: 0;
}

.empty-detail {
  min-height: 320px;
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

@media (max-width: 500px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>