<template>
  <div class="services-workspace">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        {{ t('services.title') }}
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        :label="t('services.actions.create')"
        :disable="loading || !serviceTypes.length"
        @click="openCreate"
      />
    </div>

    <ServiceFiltersComponent
      v-model="filters"
      class="q-mb-md"
    />

    <q-banner
      v-if="errorMessage"
      rounded
      class="bg-negative text-white q-mb-md"
    >
      {{ errorMessage }}
      <template #action>
        <q-btn
          flat
          color="white"
          :label="t('common.retry')"
          @click="loadServices"
        />
      </template>
    </q-banner>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <ServiceListComponent
          :services="filteredServices"
          :loading="loading"
          @select="selectedId = $event"
          @edit="openEdit"
          @duplicate="duplicateService"
          @toggle-active="toggleStatus"
          @delete="confirmDelete"
        />
      </div>
      <div class="col-12 col-lg-4">
        <div class="column q-gutter-md">
          <ServiceTestConnectionComponent :service="selectedService" />
          <ServiceUsageComponent :service="selectedService" />
        </div>
      </div>
    </div>

    <ServiceFormDialog
      :model-value="dialogOpen"
      :draft="draft"
      :service-types="serviceTypes"
      :loading-types="loading"
      :editing="editing"
      :saving="saving"
      :error-message="formError"
      @update:model-value="dialogOpen = $event"
      @update:draft="draft = $event"
      @save="saveService"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import ServiceFiltersComponent from './ServiceFiltersComponent.vue';
import ServiceListComponent from './ServiceListComponent.vue';
import ServiceFormDialog from './ServiceFormDialog.vue';
import ServiceTestConnectionComponent from './ServiceTestConnectionComponent.vue';
import ServiceUsageComponent from './ServiceUsageComponent.vue';
import { serviceService } from 'src/services/services/serviceService';
import type { Service, ServiceFilters, ServiceFormDraft, ServiceTypeCatalogItem } from 'src/models/services/Service';

const { t } = useI18n();
const $q = useQuasar();

const services = ref<Service[]>([]);
const serviceTypes = ref<ServiceTypeCatalogItem[]>([]);
const selectedId = ref<string>('');
const filters = ref<ServiceFilters>({ search: '', type: '', status: '' });
const loading = ref(false);
const errorMessage = ref('');
const dialogOpen = ref(false);
const editing = ref(false);
const saving = ref(false);
const formError = ref('');
const draft = ref<ServiceFormDraft>(serviceService.getDefaultDraft());

const filteredServices = computed(() => {
  const search = filters.value.search.trim().toLowerCase();
  return services.value.filter((service) => {
    const matchesText = !search || `${service.name} ${service.type}`.toLowerCase().includes(search);
    const matchesType = !filters.value.type || service.type === filters.value.type;
    const matchesStatus = !filters.value.status || (service.enabled ? 'ACTIVE' : 'INACTIVE') === filters.value.status;
    return matchesText && matchesType && matchesStatus;
  });
});

const selectedService = computed(() => services.value.find((item) => item.id === selectedId.value) ?? null);

onMounted(() => {
  void loadServices();
});

function openCreate(): void {
  editing.value = false;
  draft.value = serviceService.getDefaultDraft();
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(service: Service): void {
  editing.value = true;
  selectedId.value = service.id;
  draft.value = {
    code: service.code,
    name: service.name,
    description: service.description ?? '',
    type: service.type,
    serviceTypeId: serviceTypes.value.find((item) => item.code === service.type)?.id ?? null,
    authType: service.authType,
    status: service.status,
    enabled: service.enabled,
    connectionConfig: typeof service.connectionConfig === 'object' && service.connectionConfig ? { ...service.connectionConfig } : {},
    additionalParameters: service.additionalParameters.map((item) => ({ ...item })),
  };
  formError.value = '';
  dialogOpen.value = true;
}

async function loadServices(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [serviceList, types] = await Promise.all([
      serviceService.listServices(filters.value),
      serviceTypes.value.length ? Promise.resolve(serviceTypes.value) : serviceService.listServiceTypes(),
    ]);
    services.value = serviceList;
    serviceTypes.value = types;
    if (!selectedId.value && services.value[0]) selectedId.value = services.value[0].id;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('services.errors.load');
  } finally {
    loading.value = false;
  }
}

async function saveService(): Promise<void> {
  saving.value = true;
  formError.value = '';
  try {
    const result = editing.value && selectedService.value
      ? await serviceService.updateService(selectedService.value.id, draft.value)
      : await serviceService.createService(draft.value);

    if (!result) {
      formError.value = t('services.errors.save');
      return;
    }

    dialogOpen.value = false;
    await loadServices();
    selectedId.value = result.id;
    $q.notify({ type: 'positive', message: t('services.messages.saved') });
  } catch (error) {
    formError.value = error instanceof Error ? error.message : t('services.errors.save');
  } finally {
    saving.value = false;
  }
}

async function duplicateService(service: Service): Promise<void> {
  try {
    const result = await serviceService.duplicateService(service.id);
    if (!result) {
      $q.notify({ type: 'negative', message: t('services.errors.duplicate') });
      return;
    }
    await loadServices();
    selectedId.value = result.id;
    $q.notify({ type: 'positive', message: t('services.messages.duplicated') });
  } catch (error) {
    $q.notify({ type: 'negative', message: error instanceof Error ? error.message : t('services.errors.duplicate') });
  }
}

async function toggleStatus(service: Service): Promise<void> {
  try {
    const nextEnabled = !service.enabled;
    const result = await serviceService.toggleStatus(service.id, nextEnabled);
    if (!result) {
      $q.notify({ type: 'negative', message: t('services.errors.updateStatus') });
      return;
    }
    await loadServices();
    selectedId.value = result.id;
    $q.notify({ type: 'positive', message: nextEnabled ? t('services.messages.activated') : t('services.messages.deactivated') });
  } catch (error) {
    $q.notify({ type: 'negative', message: error instanceof Error ? error.message : t('services.errors.updateStatus') });
  }
}

function confirmDelete(service: Service): void {
  $q.dialog({
    title: t('services.confirm.deleteTitle'),
    message: t('services.confirm.deleteMessage', { name: service.name }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const deleted = await serviceService.deleteService(service.id);
      if (!deleted) {
        $q.notify({ type: 'negative', message: t('services.errors.delete') });
        return;
      }
      await loadServices();
      $q.notify({ type: 'positive', message: t('services.messages.deleted') });
    } catch (error) {
      $q.notify({ type: 'negative', message: error instanceof Error ? error.message : t('services.errors.delete') });
    }
  });
}
</script>

<style scoped>
.services-workspace {
  width: 100%;
}
</style>
