<template>
  <q-card flat bordered class="method-list">
    <q-list separator>
      <q-item
        v-for="method in methods"
        :key="method.id"
        clickable
        :active="selectedId === method.id"
        active-class="method-selected"
        @click="emit('select', method.id)"
      >
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ methodTypeLabel(method.type) }} - {{ method.name }}</q-item-label>
          <q-item-label caption>{{ t(`extractionMethods.discoveryStatus.${method.discovery.status.toLowerCase()}`) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row no-wrap">
            <q-btn flat round dense icon="edit" :aria-label="t('common.edit')" @click.stop="emit('edit', method)" />
            <q-btn flat round dense color="negative" icon="delete" :aria-label="t('common.delete')" @click.stop="emit('delete', method)" />
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="!loading && methods.length === 0">
        <q-item-section class="km-muted">{{ t('extractionMethods.empty') }}</q-item-section>
      </q-item>
      <q-item v-if="loading"><q-item-section><q-spinner color="primary" /></q-item-section></q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ExtractionMethod, ExtractionMethodType } from 'src/models/extraction-method';

defineProps<{
  methods: ExtractionMethod[];
  selectedId: string;
  loading: boolean;
  methodTypeLabel: (type: ExtractionMethodType) => string;
}>();

const emit = defineEmits<{
  select: [id: string];
  edit: [method: ExtractionMethod];
  delete: [method: ExtractionMethod];
}>();
const { t } = useI18n();
</script>

<style scoped>
.method-list {
  min-width: 0;
}

.method-selected {
  background: color-mix(in srgb, var(--km-primary) 12%, var(--km-surface));
}
</style>