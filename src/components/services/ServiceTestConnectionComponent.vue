<template>
  <q-card
    flat
    bordered
  >
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2">
          {{ t('services.actions.testConnection') }}
        </div>
        <q-btn
          color="primary"
          :loading="testing"
          :label="t('services.actions.testConnection')"
          @click="runTest"
        />
      </div>
      <div
        v-if="result"
        class="text-body2"
      >
        <q-badge
          :color="result.success ? 'positive' : 'negative'"
          :label="result.status"
        />
        <div class="q-mt-sm">
          {{ result.message }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { serviceService } from 'src/services/services/serviceService';
import type { Service, ServiceConnectionTestResult } from 'src/models/services/Service';

const { t } = useI18n();
const props = defineProps<{ service: Service | null }>();
const testing = ref(false);
const result = ref<ServiceConnectionTestResult | null>(null);

async function runTest(): Promise<void> {
  if (!props.service) return;
  testing.value = true;
  try {
    result.value = await serviceService.testConnection(props.service.id);
  } finally {
    testing.value = false;
  }
}
</script>
