<template>
  <q-table
    flat
    bordered
    row-key="id"
    :rows="services"
    :columns="columns"
    :loading="loading"
    :rows-per-page-options="[5, 10, 25]"
    :pagination="{ rowsPerPage: 10, sortBy: 'updatedAt', descending: true }"
    :no-data-label="t('services.empty')"
  >
    <template #body-cell-name="slotProps">
      <q-td :props="slotProps">
        <div class="text-weight-medium">
          {{ slotProps.row.name }}
        </div>
      </q-td>
    </template>
    <template #body-cell-status="slotProps">
      <q-td :props="slotProps">
        <q-badge
          :color="slotProps.row.enabled ? 'positive' : 'grey-7'"
          :label="slotProps.row.enabled ? t('common.active') : t('common.inactive')"
        />
      </q-td>
    </template>
    <template #body-cell-actions="slotProps">
      <q-td
        :props="slotProps"
        class="text-right no-wrap"
      >
        <q-btn
          flat
          round
          dense
          icon="visibility"
          @click.stop="emit('select', slotProps.row.id)"
        />
        <q-btn
          flat
          round
          dense
          icon="edit"
          @click.stop="emit('edit', slotProps.row)"
        />
        <q-btn
          flat
          round
          dense
          icon="content_copy"
          @click.stop="emit('duplicate', slotProps.row)"
        />
        <q-btn
          flat
          round
          dense
          :icon="slotProps.row.enabled ? 'pause' : 'play_arrow'"
          @click.stop="emit('toggle-active', slotProps.row)"
        />
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete"
          @click.stop="emit('delete', slotProps.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Service } from 'src/models/services/Service';

defineProps<{ services: Service[]; loading: boolean }>();
const emit = defineEmits<{ select: [id: string]; edit: [service: Service]; duplicate: [service: Service]; 'toggle-active': [service: Service]; delete: [service: Service]; }>();
const { t } = useI18n();

const columns = computed(() => [
  { name: 'name', label: t('services.fields.name'), field: 'name', align: 'left' as const, sortable: true },
  { name: 'type', label: t('services.fields.type'), field: 'type', align: 'left' as const, sortable: true },
  { name: 'status', label: t('common.status'), field: 'enabled', align: 'left' as const, sortable: true },
  { name: 'updatedAt', label: t('services.fields.updatedAt'), field: 'updatedAt', align: 'left' as const, sortable: true, format: (value: string) => new Date(value).toLocaleString() },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' as const },
]);

</script>
