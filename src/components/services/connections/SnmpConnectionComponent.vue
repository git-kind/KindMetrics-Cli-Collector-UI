<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-input
        v-model="target.host"
        :label="t('services.fields.host')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model.number="target.port"
        type="number"
        :label="t('services.fields.port')"
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
    <div class="col-12 col-md-6">
      <q-input
        v-model.number="target.retries"
        type="number"
        :label="t('services.fields.retries')"
        outlined
        dense
      />
    </div>
    <div class="col-12">
      <q-input
        v-model="target.community"
        :label="t('services.fields.community')"
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
