<template>
  <section class="company-page-content">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5">{{ t('companyContext.selectTitle') }}</div>
        <div class="text-body2 km-muted">{{ t('companyContext.selectDescription') }}</div>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        :label="t('companyContext.createAction')"
        @click="emit('create')"
      />
    </div>

    <q-banner v-if="loadFailed" class="q-mb-md" rounded>
      {{ t('companyContext.loadError') }}
    </q-banner>
    <q-list bordered separator>
      <q-item v-for="company in companies" :key="company.id" class="company-row">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="business" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ company.name }}</q-item-label>
          <q-item-label caption>
            {{ t('companyContext.code') }}: {{ company.code }}
            <span class="company-database">{{ t('companyContext.databaseName') }}: {{ company.databaseName }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            color="primary"
            outline
            :label="t('companyContext.selectAction')"
            @click="emit('select', company)"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="!loading && companies.length === 0">
        <q-item-section>{{ t('companyContext.empty') }}</q-item-section>
      </q-item>
    </q-list>
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="32px" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Company } from '../../models/company';
import { companyService } from '../../services/company.service';

const emit = defineEmits<{
  (event: 'select', company: Company): void;
  (event: 'create'): void;
}>();

const { t } = useI18n();
const companies = ref<Company[]>([]);
const loading = ref(true);
const loadFailed = ref(false);

onMounted(async () => {
  try {
    companies.value = await companyService.listCompanies();
  } catch {
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.company-page-content {
  width: min(900px, 100%);
  margin: 0 auto;
}

.company-row {
  min-height: 76px;
}

.company-database {
  margin-left: 16px;
}

@media (max-width: 600px) {
  .company-database {
    display: block;
    margin: 4px 0 0;
  }
}
</style>