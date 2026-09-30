<template>
  <q-card class="installation-card" :style="{ '--install-accent': currentSkin.primary }">
    <header class="installation-header">
      <div class="brand-lockup">
        <img :src="kindLogo" alt="Kind Technologies" class="brand-logo" />
        <div>
          <div class="brand-name">Kind Technologies</div>
          <div class="brand-product">{{ t('app.title') }}</div>
        </div>
      </div>
      <q-btn-toggle
        :model-value="locale"
        :options="languageOptions"
        dense
        unelevated
        toggle-color="primary"
        class="language-toggle"
        :aria-label="t('common.language')"
        @update:model-value="setLanguage"
      />
    </header>

    <div class="wizard-heading">
      <div class="eyebrow">{{ t('installation.eyebrow') }}</div>
      <h1>{{ t('installation.title') }}</h1>
      <p>{{ t('installation.subtitle') }}</p>
      <q-badge v-if="mode !== 'KIND'" :color="status === 'ERROR' ? 'negative' : 'warning'" class="q-mt-sm">
        {{ t(status === 'ERROR' ? 'installation.status.error' : 'installation.status.notConfigured') }}
      </q-badge>
    </div>

    <q-banner v-if="status === 'ERROR'" rounded class="status-banner q-mb-md">
      <template #avatar><q-icon name="warning" color="negative" /></template>
      {{ t('installation.status.error') }}
    </q-banner>

    <q-stepper
      v-else-if="mode === 'CUSTOMER' || isKindCompanySetup"
      v-model="step"
      flat
      animated
      color="primary"
      class="installation-stepper"
    >
      <q-step :name="1" :title="t('installation.steps.company')" icon="business" :done="step > 1">
        <InstallationCompanyStepComponent
          v-if="mode === 'CUSTOMER'"
          :company-id="companyId"
          :company="company"
          :company-lookup-failed="companyLookupFailed"
          @update:company-id="companyId = $event"
          @resolve-company="resolveCompany"
          @continue="nextFromCompany"
        />
        <CompanyCreateComponent
          v-else
          @created="onKindCompanyCreated"
          @cancel="returnToCompanySelection"
        />
      </q-step>

      <q-step :name="2" :title="t('installation.steps.database')" icon="storage" :done="step > 2">
        <InstallationDatabaseStepComponent
          :database="database"
          :readonly="isKindCompanySetup"
          @update:database="updateDatabase"
          @back="step = 1"
          @continue="nextFromDatabase"
        />
      </q-step>

      <q-step :name="3" :title="t('installation.steps.connection')" icon="cable" :done="step > 3">
        <InstallationConnectionStepComponent
          :database="database"
          :state="connectionState"
          :message-key="connectionMessageKey"
          @back="step = 2"
          @test="runConnectionTest"
          @continue="step = 4"
        />
      </q-step>

      <q-step :name="4" :title="t('installation.steps.save')" icon="save">
        <InstallationSaveStepComponent
          :company-id="company?.id ?? companyId"
          :connection-state="connectionState"
          :saving="saving"
          :save-failed="saveFailed"
          @back="step = 3"
          @save="saveConfiguration"
        />
      </q-step>
    </q-stepper>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import kindLogo from 'src/assets/Kind-Logo.png';
import CompanyCreateComponent from 'src/components/company/CompanyCreateComponent.vue';
import type { Company } from 'src/models/company';
import InstallationCompanyStepComponent from './InstallationCompanyStepComponent.vue';
import InstallationConnectionStepComponent from './InstallationConnectionStepComponent.vue';
import InstallationDatabaseStepComponent from './InstallationDatabaseStepComponent.vue';
import InstallationSaveStepComponent from './InstallationSaveStepComponent.vue';
import { useUi } from 'src/composables/useUi';
import type {
  ConnectionTestState,
  DatabaseConfiguration,
  InstallationCompany,
  InstallationMode,
  InstallationStatus,
} from 'src/models/installation';
import { installationService } from 'src/services/installation.service';

const emit = defineEmits<{
  configured: [mode: InstallationMode, companyId?: string];
}>();
const { t, locale } = useI18n();
const { currentSkin, setLanguage } = useUi();
const route = useRoute();
const router = useRouter();
const mode = ref<InstallationMode | null>(null);
const isKindCompanySetup = computed(() => mode.value === 'KIND' && route.query.createCompany === '1');
const step = ref(1);
const status = ref<InstallationStatus>('NOT_CONFIGURED');
const companyId = ref('7f8c2a91-4f12-4a6d-b123-9c1e8d7f1234');
const company = ref<InstallationCompany | null>(null);
const companyLookupFailed = ref(false);
const database = reactive<DatabaseConfiguration>({ databaseName: 'KindMetrics_PatitoFeo' });
const connectionState = ref<ConnectionTestState>('idle');
const connectionMessageKey = ref('installation.connection.success');
const saving = ref(false);
const saveFailed = ref(false);
const languageOptions = [
  { label: 'ES', value: 'es' },
  { label: 'EN', value: 'en' },
];
watch(database, () => {
  connectionState.value = 'idle';
  saveFailed.value = false;
}, { deep: true });

onMounted(async () => {
  try {
    status.value = await installationService.getStatus();
    mode.value = await installationService.getMode();
    if (mode.value === 'CUSTOMER') await resolveCompany();
  } catch {
    status.value = 'ERROR';
  }
});

function onKindCompanyCreated(createdCompany: Company): void {
  company.value = {
    id: createdCompany.id,
    code: createdCompany.code,
    name: createdCompany.name,
    databaseName: createdCompany.databaseName,
  };
  database.databaseName = createdCompany.databaseName;
  step.value = 2;
}

function returnToCompanySelection(): void {
  void router.push({ name: 'company-select' });
}

async function resolveCompany(): Promise<void> {
  try {
    company.value = await installationService.findCompany(companyId.value);
    if (company.value) database.databaseName = company.value.databaseName;
  } catch {
    company.value = null;
  }
  companyLookupFailed.value = companyId.value.length > 0 && company.value === null;
}

async function nextFromCompany(): Promise<void> {
  await resolveCompany();
  if (company.value) step.value = 2;
}

async function nextFromDatabase(): Promise<void> {
  step.value = 3;
}

function updateDatabase(value: DatabaseConfiguration): void {
  Object.assign(database, value);
}

async function runConnectionTest(): Promise<void> {
  connectionState.value = 'testing';
  saveFailed.value = false;
  try {
    const result = await installationService.testConnection({ ...database });
    connectionState.value = result.success ? 'success' : 'error';
    connectionMessageKey.value = result.messageKey;
  } catch {
    connectionState.value = 'error';
    connectionMessageKey.value = 'installation.connection.error';
  }
}

async function saveConfiguration(): Promise<void> {
  if (connectionState.value !== 'success' || !company.value) return;
  saving.value = true;
  saveFailed.value = false;
  try {
    if (isKindCompanySetup.value) {
      emit('configured', 'KIND', company.value.id);
      return;
    }

    const configured = await installationService.saveConfiguration({
      companyId: company.value.id,
      database: { ...database },
    });
    if (!configured) {
      saveFailed.value = true;
      status.value = 'ERROR';
      return;
    }
    status.value = 'CONFIGURED';
    emit('configured', 'CUSTOMER', company.value.id);
  } catch {
    saveFailed.value = true;
    status.value = 'ERROR';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.installation-card {
  width: min(900px, calc(100vw - 32px));
  padding: 28px clamp(18px, 4vw, 48px) 36px;
  border: 1px solid #dce5e7;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(18, 59, 73, 0.12);
}

.installation-header,
.brand-lockup,
.step-actions,
.step-actions-split,
.connection-summary > div {
  display: flex;
  align-items: center;
}

.installation-header,
.step-actions-split {
  justify-content: space-between;
}

.brand-lockup {
  gap: 12px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.brand-name {
  color: #123b49;
  font-weight: 700;
}

.brand-product,
.step-description {
  color: #65777e;
}

.language-toggle {
  color: var(--install-accent);
}

.wizard-heading {
  margin: 34px 0 18px;
  border-bottom: 1px solid #e4ebec;
  padding-bottom: 20px;
}

.eyebrow {
  color: var(--install-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 6px 0;
  color: #123b49;
  font-size: 28px;
  font-weight: 700;
}

.wizard-heading p {
  margin: 0;
  color: #65777e;
}

.installation-stepper :deep(.q-stepper__step-inner) {
  padding: 22px 0 12px;
}

.status-banner {
  background: #fbefed;
  color: #8e3025;
}

@media (max-width: 600px) {
  .installation-card {
    padding: 20px 16px 24px;
  }

  .wizard-heading {
    margin-top: 24px;
  }

  h1 {
    font-size: 23px;
  }

}
</style>