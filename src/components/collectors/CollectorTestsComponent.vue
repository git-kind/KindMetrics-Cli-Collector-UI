<template>
  <div>
    <q-banner rounded class="bg-blue-grey-1 text-blue-grey-10 q-mb-md">
      <template #avatar><q-icon name="info" color="primary" /></template>
      {{ t('collectors.tests.mockNotice') }}
    </q-banner>
    <q-list bordered separator class="rounded-borders">
      <q-item v-for="test in tests" :key="test.type">
        <q-item-section>
          <q-item-label>{{ t(test.label) }}</q-item-label>
          <q-item-label v-if="results[test.type]" caption>
            {{ t(results[test.type]!.messageKey) }}
            <span> · {{ t('collectors.units.milliseconds', { count: results[test.type]!.durationMs }) }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            outline
            color="primary"
            :loading="runningTest === test.type"
            :disable="runningTest !== null || !can('collector.execute')"
            :label="t(runningTest === test.type ? 'collectors.tests.running' : 'collectors.tests.run')"
            icon="play_arrow"
            @click="execute(test.type)"
          />
        </q-item-section>
        <q-item-section side v-if="results[test.type]">
          <q-badge
            :color="results[test.type]?.status === 'SUCCESS' ? 'positive' : 'negative'"
            :label="t(`collectors.testStatus.${results[test.type]?.status.toLowerCase()}`)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthorization } from 'src/composables/useAuthorization';
import type {
  CollectorTestResultMock,
  CollectorTestType,
} from 'src/models/collector';
import { collectorService } from 'src/services/collector.service';

const props = defineProps<{ collectorId: string }>();
const { t } = useI18n();
const { can } = useAuthorization();
const runningTest = ref<CollectorTestType | null>(null);
const results = ref<Partial<Record<CollectorTestType, CollectorTestResultMock>>>({});
const tests: Array<{ type: CollectorTestType; label: string }> = [
  { type: 'connection', label: 'collectors.tests.connection' },
  { type: 'extraction', label: 'collectors.tests.extraction' },
  { type: 'transformation', label: 'collectors.tests.transformation' },
  { type: 'mapping', label: 'collectors.tests.mapping' },
  { type: 'storage', label: 'collectors.tests.storage' },
];

async function execute(type: CollectorTestType): Promise<void> {
  runningTest.value = type;
  try {
    results.value[type] = await collectorService.executeCollectorTest(props.collectorId, type) ?? {
      status: 'ERROR',
      messageKey: 'collectors.tests.error',
      durationMs: 0,
    };
  } catch {
    results.value[type] = {
      status: 'ERROR',
      messageKey: 'collectors.tests.error',
      durationMs: 0,
    };
  } finally {
    runningTest.value = null;
  }
}
</script>