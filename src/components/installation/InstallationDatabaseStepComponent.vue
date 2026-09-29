<template>
  <q-form ref="formRef" class="step-content" @submit.prevent="continueToConnection">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">
      {{ t('installation.database.title') }}
    </div>
    <p class="step-description">{{ t('installation.database.description') }}</p>
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-sm-8">
        <q-input
          :model-value="database.host"
          outlined
          :label="t('installation.database.host')"
          :rules="[requiredRule]"
          @update:model-value="updateField('host', String($event ?? ''))"
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          :model-value="database.port"
          outlined
          type="number"
          :label="t('installation.database.port')"
          :rules="[portRule]"
          @update:model-value="updateField('port', Number($event))"
        />
      </div>
    </div>
    <q-input
      :model-value="database.database"
      outlined
      :label="t('installation.database.database')"
      :rules="[requiredRule]"
      @update:model-value="updateField('database', String($event ?? ''))"
    />
    <q-input
      :model-value="database.username"
      outlined
      :label="t('installation.database.username')"
      :rules="[requiredRule]"
      autocomplete="username"
      @update:model-value="updateField('username', String($event ?? ''))"
    />
    <q-input
      :model-value="database.password"
      outlined
      :type="passwordVisible ? 'text' : 'password'"
      :label="t('installation.database.password')"
      :rules="[requiredRule]"
      autocomplete="new-password"
      @update:model-value="updateField('password', String($event ?? ''))"
    >
      <template #append>
        <q-icon
          :name="passwordVisible ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="passwordVisible = !passwordVisible"
        />
      </template>
    </q-input>
    <q-toggle
      :model-value="database.ssl"
      :label="t('installation.database.ssl')"
      color="primary"
      @update:model-value="updateField('ssl', $event)"
    />
    <div class="step-actions step-actions-split">
      <q-btn flat :label="t('common.back')" icon="arrow_back" @click="emit('back')" />
      <q-btn
        color="primary"
        unelevated
        :label="t('common.continue')"
        icon-right="arrow_forward"
        @click="continueToConnection"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DatabaseConfiguration } from 'src/models/installation';

const props = defineProps<{ database: DatabaseConfiguration }>();
const emit = defineEmits<{
  (event: 'update:database', value: DatabaseConfiguration): void;
  (event: 'back'): void;
  (event: 'continue'): void;
}>();

const { t } = useI18n();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const passwordVisible = ref(false);
const requiredRule = (value: string | number) => !!String(value).trim() || t('common.required');
const portRule = (value: number) =>
  (Number.isInteger(value) && value >= 1 && value <= 65535) || t('installation.database.invalidPort');

function updateField<Key extends keyof DatabaseConfiguration>(
  key: Key,
  value: DatabaseConfiguration[Key],
): void {
  emit('update:database', { ...props.database, [key]: value });
}

async function continueToConnection(): Promise<void> {
  if (await formRef.value?.validate()) emit('continue');
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

@media (max-width: 600px) {
  .step-actions-split {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>