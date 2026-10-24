<template>
  <q-form ref="formRef" class="step-content" @submit.prevent="continueToConnection">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">
      {{ t('installation.database.title') }}
    </div>
    <p class="step-description">
      {{ t(kindCompanySetup ? 'installation.database.apiManagedDescription' : readonly ? 'installation.database.companyCreatedDescription' : 'installation.database.description') }}
    </p>
      <q-input
        v-if="!readonly && !kindCompanySetup"
      :model-value="database.databaseName"
      outlined
      :readonly="readonly"
      :label="t('installation.database.databaseName')"
      :rules="[requiredRule]"
      @update:model-value="updateField('databaseName', String($event ?? ''))"
    />
      <div v-else-if="!kindCompanySetup" class="database-summary">
        <span>{{ t('installation.database.databaseName') }}</span>
        <strong>{{ database.databaseName }}</strong>
      </div>
      <div class="row items-center q-gutter-sm q-mt-md">
        <q-btn
          outline
          color="primary"
          :loading="state === 'testing'"
          :label="t('installation.connection.validate')"
          icon="cable"
          @click="testConnection"
        />
        <q-badge v-if="state !== 'idle'" :color="stateColor">
          {{ t(`installation.connection.states.${state}`) }}
        </q-badge>
      </div>
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
      <q-btn
        flat
        :label="t(kindCompanySetup ? 'installation.returnToCompanies' : 'common.back')"
        icon="arrow_back"
        @click="kindCompanySetup ? emit('return-to-companies') : emit('back')"
      />
      <q-btn
        color="primary"
        unelevated
        :label="t(kindCompanySetup ? 'installation.finish' : 'common.continue')"
        :icon-right="kindCompanySetup ? 'check' : 'arrow_forward'"
        :disable="state !== 'success'"
        @click="continueToConnection"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ConnectionTestState, DatabaseConfiguration } from 'src/models/installation';

const props = withDefaults(defineProps<{
  database: DatabaseConfiguration;
  readonly?: boolean;
  kindCompanySetup?: boolean;
  state: ConnectionTestState;
  messageKey: string;
}>(), {
  readonly: false,
  kindCompanySetup: false,
});
const emit = defineEmits<{
  (event: 'update:database', value: DatabaseConfiguration): void;
  (event: 'back'): void;
  (event: 'continue'): void;
  (event: 'return-to-companies'): void;
  (event: 'test'): void;
}>();

const { t } = useI18n();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const requiredRule = (value: string | number) => !!String(value).trim() || t('common.required');
const stateColor = computed(() => {
  if (props.state === 'error') return 'negative';
  if (props.state === 'success') return 'positive';
  return 'grey-7';
});

function updateField<Key extends keyof DatabaseConfiguration>(
  key: Key,
  value: DatabaseConfiguration[Key],
): void {
  emit('update:database', { ...props.database, [key]: value });
}

async function testConnection(): Promise<void> {
  if (props.readonly || await formRef.value?.validate()) emit('test');
}

async function continueToConnection(): Promise<void> {
  if (props.state === 'success' && (props.readonly || await formRef.value?.validate())) emit('continue');
}
</script>

<style scoped>
.step-content {
  max-width: 650px;
}

.step-description {
  margin: 0 0 20px;
  color: #65777e;
}

.step-actions {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.step-actions-split {
  justify-content: space-between;
}

.database-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  color: #65777e;
}

.database-summary strong {
  color: #123b49;
  overflow-wrap: anywhere;
}

.connection-result.success {
  background: #e9f5ef;
  color: #17633f;
}

.connection-result.error {
  background: #fbefed;
  color: #8e3025;
}

@media (max-width: 600px) {
  .step-actions-split {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>