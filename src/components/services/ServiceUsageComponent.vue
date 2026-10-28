<template>
  <q-card
    flat
    bordered
  >
    <q-card-section>
      <div class="text-subtitle2 q-mb-sm">
        {{ t('services.fields.usage') }}
      </div>
      <div
        v-if="items.length === 0"
        class="text-grey-6"
      >
        {{ t('services.emptyState.usage') }}
      </div>
      <q-list
        v-else
        dense
      >
        <q-item
          v-for="item in items"
          :key="item.id"
        >
          <q-item-section>{{ item.collectorName }}</q-item-section>
          <q-item-section side>
            {{ item.status }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Service, ServiceUsage } from 'src/models/services/Service';
import { serviceService } from 'src/services/services/serviceService';

const { t } = useI18n();
const props = defineProps<{ service: Service | null }>();
const items = ref<ServiceUsage[]>([]);

watch(() => props.service?.id, async (id) => {
  if (!id) {
    items.value = [];
    return;
  }

  try {
    items.value = await serviceService.getUsage(id);
  } catch {
    items.value = [];
  }
}, { immediate: true });
</script>
