<template>
  <div class="step-content">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">
      {{ t('installation.connection.title') }}
    </div>
    <p class="step-description">{{ t('installation.connection.description') }}</p>
    <div class="connection-summary">
      <div>
        <span>{{ t('installation.database.databaseName') }}</span>
        <strong>{{ database.databaseName }}</strong>
      </div>
    </div>
    <div class="mock-hint">{{ t('installation.connection.mockHint') }}</div>
    <q-badge :color="stateColor" class="q-mt-md">
      {{ t(`installation.connection.states.${state}`) }}
    </q-badge>
    <q-banner
      v-if="state === 'success' || state === 'error'"
      rounded
      :class="['connection-result', state]"
      class="q-mt-md"
    >
      <template #avatar>
        <q-icon :name="state === 'success' ? 'check_circle' : 'error'" />
      </template>
      {{ t(messageKey) }}
    </q-banner>
    <div class="step-actions step-actions-split">
      <q-btn flat :label="t('common.back')" icon="arrow_back" @click="emit('back')" />
      <div class="row items-center q-gutter-sm">
        <q-btn
          outline
          color="primary"
          :loading="state === 'testing'"
          :label="t('installation.connection.validate')"
          icon="cable"
          @click="emit('test')"
        />
        <q-btn
          color="primary"
          unelevated
          :label="t('common.continue')"
          icon-right="arrow_forward"
          :disable="state !== 'success'"
          @click="emit('continue')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  ConnectionTestState,
  DatabaseConfiguration,
} from 'src/models/installation';

const props = defineProps<{
  database: DatabaseConfiguration;
  state: ConnectionTestState;
  messageKey: string;
}>();
const emit = defineEmits<{
  (event: 'back'): void;
  (event: 'test'): void;
  (event: 'continue'): void;
}>();

const { t } = useI18n();
const stateColor = computed(() => {
  if (props.state === 'error') return 'negative';
  if (props.state === 'success') return 'positive';
  return 'grey-7';
});
</script>

<style scoped>
.step-content {
  max-width: 650px;
}

.step-description {
  margin: 0 0 20px;
  color: #65777e;
}

.connection-summary {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e0e8e9;
  border-radius: 6px;
}

.connection-summary > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.connection-summary span,
.mock-hint {
  color: #65777e;
}

.connection-summary strong {
  overflow-wrap: anywhere;
  text-align: right;
}

.mock-hint {
  margin-top: 12px;
  font-size: 12px;
}

.connection-result.success {
  background: #e9f5ef;
  color: #17633f;
}

.connection-result.error {
  background: #fbefed;
  color: #8e3025;
}

.step-actions {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.step-actions-split {
  justify-content: space-between;
}

@media (max-width: 600px) {
  .step-actions-split {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .step-actions-split > .row {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>