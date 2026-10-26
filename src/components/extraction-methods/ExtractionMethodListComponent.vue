<template>
  <q-table
    flat
    bordered
    row-key="id"
    :rows="methods"
    :columns="columns"
    :loading="loading"
    :pagination="{ sortBy: 'updatedAt', descending: true, rowsPerPage: 10 }"
    :rows-per-page-options="[5, 10, 25]"
    :no-data-label="t('extractionMethods.empty')"
    @row-click="(_event, row) => emit('select', row.id)"
  >
    <template #body-cell-name="slotProps">
      <q-td :props="slotProps">
        <div class="text-weight-medium">
          {{ slotProps.row.name }}
        </div>
        <div class="text-caption km-muted">
          {{ slotProps.row.code }}
        </div>
      </q-td>
    </template>
    <template #body-cell-status="slotProps">
      <q-td :props="slotProps">
        <q-badge
          :color="slotProps.row.isActive ? 'positive' : 'grey-7'"
          :label="t(slotProps.row.isActive ? 'common.active' : 'common.inactive')"
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
          :aria-label="t('extractionMethods.actions.view')"
          @click.stop="emit('select', slotProps.row.id)"
        />
        <q-btn
          flat
          round
          dense
          icon="edit"
          :aria-label="t('common.edit')"
          @click.stop="emit('edit', slotProps.row)"
        />
        <q-btn
          flat
          round
          dense
          icon="content_copy"
          :aria-label="t('extractionMethods.actions.duplicate')"
          @click.stop="emit('duplicate', slotProps.row)"
        />
        <q-btn
          flat
          round
          dense
          :icon="slotProps.row.isActive ? 'pause' : 'play_arrow'"
          :aria-label="t(slotProps.row.isActive ? 'extractionMethods.actions.deactivate' : 'extractionMethods.actions.activate')"
          @click.stop="emit('toggle-active', slotProps.row)"
        />
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete"
          :aria-label="t('common.delete')"
          @click.stop="emit('delete', slotProps.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExtractionMethod } from 'src/models/extraction-method';

defineProps<{ methods: ExtractionMethod[]; loading: boolean }>();
const emit = defineEmits<{
  select: [id: string];
  edit: [method: ExtractionMethod];
  duplicate: [method: ExtractionMethod];
  'toggle-active': [method: ExtractionMethod];
  delete: [method: ExtractionMethod];
}>();
const { t, d } = useI18n();

const columns = computed(() => [
  { name: 'name', label: t('extractionMethods.fields.name'), field: 'name', align: 'left' as const, sortable: true },
  { name: 'protocol', label: t('extractionMethods.fields.protocol'), field: 'protocol', align: 'left' as const, sortable: true },
  { name: 'requestCount', label: t('extractionMethods.fields.operationCount'), field: (row: ExtractionMethod) => row.requests.length, align: 'right' as const, sortable: true },
  { name: 'status', label: t('common.status'), field: 'isActive', align: 'left' as const, sortable: true },
  { name: 'updatedAt', label: t('extractionMethods.fields.updatedAt'), field: 'updatedAt', align: 'left' as const, sortable: true, format: formatDate },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' as const },
]);

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : d(date, 'short');
}
</script>

<style scoped>
.q-table {
  min-width: 0;
}

.q-table :deep(tbody tr) {
  cursor: pointer;
}
</style>