<template>
  <div class="row q-col-gutter-md">
    <div class="col-12">
      <q-input
        v-model="target.baseUrl"
        :label="t('services.fields.baseUrl')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="target.clientId"
        :label="t('services.fields.clientId')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="target.scope"
        :label="t('services.fields.scope')"
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
