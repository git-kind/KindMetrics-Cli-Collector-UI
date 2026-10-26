<template>
  <div class="companies-management">
    <section class="companies-content">
      <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
        <div class="col">
          <h1 class="text-h5 q-my-none">
            {{ t('menu.companies') }}
          </h1>
          <div class="text-body2 text-grey-7 q-mt-xs">
            {{ t('companyContext.managementDescription') }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            unelevated
            icon="add"
            :label="t('companyContext.createAction')"
            @click="openCreate"
          />
        </div>
      </div>

      <div class="row items-center q-mb-md">
        <q-input
          v-model="filter"
          dense
          outlined
          clearable
          :placeholder="t('common.search')"
          class="company-search"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-banner
        v-if="loadFailed"
        class="q-mb-md bg-red-1 text-negative"
        rounded
      >
        {{ loadError || t('companyContext.loadError') }}
        <template #action>
          <q-btn
            flat
            color="negative"
            :label="t('common.retry')"
            @click="loadCompanies"
          />
        </template>
      </q-banner>

      <q-table
        flat
        bordered
        :rows="filteredCompanies"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :no-data-label="t('companyContext.empty')"
        :rows-per-page-options="[10, 25, 50]"
      >
        <template #body-cell-status="slotProps">
          <q-td :props="slotProps">
            <q-badge :color="slotProps.row.status === 'ACTIVE' ? 'positive' : 'grey-7'">
              {{ slotProps.row.status === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
            </q-badge>
          </q-td>
        </template>
        <template #body-cell-actions="slotProps">
          <q-td
            :props="slotProps"
            class="text-right"
          >
            <q-btn
              flat
              round
              dense
              icon="edit"
              :aria-label="t('common.edit')"
              @click="openEdit(slotProps.row)"
            >
              <q-tooltip>{{ t('common.edit') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="slotProps.row.status === 'ACTIVE' ? 'block' : 'check_circle'"
              :color="slotProps.row.status === 'ACTIVE' ? 'warning' : 'positive'"
              :aria-label="slotProps.row.status === 'ACTIVE' ? t('companyContext.deactivate') : t('companyContext.activate')"
              :disable="isCurrentCompany(slotProps.row)"
              @click="toggleStatus(slotProps.row)"
            >
              <q-tooltip>{{ slotProps.row.status === 'ACTIVE' ? t('companyContext.deactivate') : t('companyContext.activate') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :disable="isCurrentCompany(slotProps.row)"
              :aria-label="t('common.delete')"
              @click="companyToDelete = slotProps.row"
            >
              <q-tooltip>{{ isCurrentCompany(slotProps.row) ? t('companyContext.currentCompanyProtected') : t('common.delete') }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </section>

    <q-dialog
      v-model="formDialog"
      persistent
    >
      <q-card class="company-form-dialog">
        <q-card-section>
          <div class="text-h6">
            {{ editingCompany ? t('companyContext.editTitle') : t('companyContext.createTitle') }}
          </div>
        </q-card-section>
        <q-form
          class="q-gutter-md"
          @submit.prevent="saveCompany"
        >
          <q-card-section class="q-pt-none">
            <CompanyFieldsComponent
              :model-value="form"
              :include-status="Boolean(editingCompany)"
              :status-options="statusOptions"
              @update:model-value="Object.assign(form, $event)"
            />
            <q-banner
              v-if="formError"
              rounded
              class="bg-red-1 text-negative q-mt-md"
            >
              {{ t(formError) }}
            </q-banner>
          </q-card-section>
          <q-card-actions
            align="right"
            class="q-px-md q-pb-md"
          >
            <q-btn
              flat
              :label="t('common.cancel')"
              :disable="saving"
              @click="formDialog = false"
            />
            <q-btn
              color="primary"
              unelevated
              type="submit"
              :loading="saving"
              :label="t('common.save')"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog
      :model-value="companyToDelete !== null"
      @update:model-value="value => { if (!value) companyToDelete = null }"
    >
      <q-card class="delete-dialog">
        <q-card-section>
          <div class="text-h6">
            {{ t('companyContext.deleteTitle') }}
          </div>
          <div class="q-mt-sm">
            {{ t('companyContext.deleteMessage', { name: companyToDelete?.name ?? '' }) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('common.cancel')"
            @click="companyToDelete = null"
          />
          <q-btn
            color="negative"
            unelevated
            :loading="deleting"
            :label="t('common.delete')"
            @click="deleteCompany"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuth } from 'src/composables/useAuthorization';
import CompanyFieldsComponent from './CompanyFieldsComponent.vue';
import type { Company, CompanyStatus, CreateCompanyInput, UpdateCompanyInput } from 'src/models/company';
import { companyService } from 'src/services/company.service';

const emit = defineEmits<{
  companyCreated: [companyId: string];
}>();

const $q = useQuasar();
const { t } = useI18n();
const { company: activeCompany } = useAuth();
const companies = ref<Company[]>([]);
const loading = ref(false);
const loadFailed = ref(false);
const loadError = ref('');
const filter = ref('');
const formDialog = ref(false);
const saving = ref(false);
const deleting = ref(false);
const formError = ref('');
const editingCompany = ref<Company | null>(null);
const companyToDelete = ref<Company | null>(null);
const form = reactive<UpdateCompanyInput>({
  name: '', shortName: '', code: '', databaseName: '', timezone: 'UTC', locale: 'es', configJson: {}, status: 'ACTIVE',
});
const statusOptions = [
  { label: t('common.active'), value: 'ACTIVE' as const },
  { label: t('common.inactive'), value: 'INACTIVE' as const },
];

const columns = [
  { name: 'name', label: t('companyContext.name'), field: 'name', align: 'left' as const, sortable: true },
  { name: 'shortName', label: t('companyContext.shortName'), field: 'shortName', align: 'left' as const, sortable: true },
  { name: 'code', label: t('companyContext.code'), field: 'code', align: 'left' as const, sortable: true },
  { name: 'databaseName', label: t('companyContext.databaseName'), field: 'databaseName', align: 'left' as const, sortable: true },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' as const, sortable: true },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' as const },
];

const filteredCompanies = computed(() => {
  const query = filter.value.trim().toLocaleLowerCase();
  if (!query) return companies.value;
  return companies.value.filter((company) =>
    [company.name, company.shortName, company.code, company.databaseName, company.status]
      .some((value) => value.toLocaleLowerCase().includes(query)),
  );
});

onMounted(() => void loadCompanies());

function isCurrentCompany(company: Company): boolean {
  return activeCompany.value?.id === company.id;
}

async function loadCompanies(): Promise<void> {
  loading.value = true;
  loadFailed.value = false;
  loadError.value = '';
  try {
    companies.value = await companyService.listCompanies();
  } catch (error) {
    loadFailed.value = true;
    loadError.value = error instanceof Error ? error.message : t('companyContext.loadError');
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editingCompany.value = null;
  Object.assign(form, {
    name: '', shortName: '', code: '', databaseName: '', timezone: 'UTC', locale: 'es', configJson: {},
    status: 'ACTIVE' as CompanyStatus,
  });
  formError.value = '';
  formDialog.value = true;
}

function openEdit(company: Company): void {
  editingCompany.value = company;
  Object.assign(form, {
    name: company.name,
    shortName: company.shortName,
    code: company.code,
    databaseName: company.databaseName,
    timezone: company.timezone,
    locale: company.locale,
    configJson: company.configJson,
    status: company.status,
  });
  formError.value = '';
  formDialog.value = true;
}

async function saveCompany(): Promise<void> {
  saving.value = true;
  formError.value = '';
  try {
    const result = editingCompany.value
      ? await companyService.updateCompany(editingCompany.value.id, form)
      : await companyService.createCompany(form as CreateCompanyInput);
    if (!result.success) {
      formError.value = result.reason === 'duplicate' ? 'companyContext.duplicate' : 'companyContext.required';
      return;
    }
    formDialog.value = false;
    await loadCompanies();
    if (!editingCompany.value) {
      $q.notify({ type: 'positive', message: t('companyContext.created') });
      emit('companyCreated', result.company.id);
      return;
    }
    $q.notify({ type: 'positive', message: t('companyContext.updated') });
  } catch (error) {
    formError.value = error instanceof Error ? error.message : t('companyContext.saveError');
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(company: Company): Promise<void> {
  try {
    const result = await companyService.updateCompany(company.id, {
      name: company.name,
      shortName: company.shortName,
      code: company.code,
      databaseName: company.databaseName,
      timezone: company.timezone,
      locale: company.locale,
      configJson: company.configJson,
      status: company.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    if (!result.success) throw new Error('Company status update failed');
    await loadCompanies();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('companyContext.saveError'),
    });
  }
}

async function deleteCompany(): Promise<void> {
  if (!companyToDelete.value) return;
  deleting.value = true;
  try {
    const deleted = await companyService.deleteCompany(companyToDelete.value.id);
    if (!deleted) throw new Error('Company delete failed');
    companyToDelete.value = null;
    await loadCompanies();
    $q.notify({ type: 'positive', message: t('companyContext.deleted') });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('companyContext.deleteError'),
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped>
.companies-content {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.company-search {
  width: min(380px, 100%);
}

.company-form-dialog {
  width: min(520px, calc(100vw - 32px));
  max-width: 100%;
}

.delete-dialog {
  width: min(440px, calc(100vw - 32px));
}
</style>