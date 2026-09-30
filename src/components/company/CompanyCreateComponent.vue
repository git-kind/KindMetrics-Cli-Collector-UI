<template>
  <div class="create-company-form">
    <div class="text-h5 q-mb-md">{{ t('companyContext.createTitle') }}</div>
    <div>
      <q-form class="q-gutter-md" @submit.prevent="createCompany">
        <q-input v-model="form.name" outlined :label="t('companyContext.name')" :rules="[requiredRule]" />
        <q-input v-model="form.code" outlined :label="t('companyContext.code')" :rules="[requiredRule]" />
        <q-input v-model="form.databaseName" outlined :label="t('companyContext.databaseName')" :rules="[requiredRule]" />
        <q-banner v-if="errorKey" rounded class="form-error">
          {{ t(errorKey) }}
        </q-banner>
        <div class="row justify-end q-gutter-sm">
          <q-btn flat :label="t('common.cancel')" type="button" @click="emit('cancel')" />
          <q-btn
            color="primary"
            unelevated
            type="submit"
            :loading="saving"
            :label="t('companyContext.createAction')"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Company, CreateCompanyInput } from '../../models/company';
import { companyService } from '../../services/company.service';

const emit = defineEmits<{
  (event: 'created', company: Company): void;
  (event: 'cancel'): void;
}>();

const { t } = useI18n();
const form = reactive<CreateCompanyInput>({ name: '', code: '', databaseName: '' });
const saving = ref(false);
const errorKey = ref('');
const requiredRule = (value: string) => !!value.trim() || t('common.required');

async function createCompany(): Promise<void> {
  errorKey.value = '';
  saving.value = true;
  try {
    const result = await companyService.createCompany(form);
    if (!result.success) {
      errorKey.value = result.reason === 'duplicate'
        ? 'companyContext.duplicate'
        : 'companyContext.required';
      return;
    }
    emit('created', result.company);
  } catch {
    errorKey.value = 'companyContext.createError';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.create-company-form {
  width: min(560px, 100%);
  padding: 8px 0;
}

.form-error {
  background: #fbefed;
  color: #8e3025;
}
</style>