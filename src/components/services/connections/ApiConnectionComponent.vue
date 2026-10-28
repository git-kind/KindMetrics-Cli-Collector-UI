<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-8">
      <q-input
        v-model="target.url"
        :label="t('services.fields.url')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-4">
      <q-input
        v-model.number="target.port"
        type="number"
        min="1"
        max="65535"
        :label="t('services.fields.port')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="target.method"
        :label="t('services.fields.method')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model.number="target.timeout"
        type="number"
        :label="t('services.fields.timeout')"
        outlined
        dense
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceFormDraft } from 'src/models/services/Service';

type ConnectionFieldValue = string | number | null | undefined;

const { t } = useI18n();
const props = defineProps<{ draft: ServiceFormDraft }>();
const target = computed(() => (props.draft.connectionConfig ?? {}) as Record<string, ConnectionFieldValue>);
</script>
