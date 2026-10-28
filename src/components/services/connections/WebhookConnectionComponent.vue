<template>
  <div class="row q-col-gutter-md">
    <div class="col-12">
      <q-input
        v-model="target.route"
        :label="t('services.fields.route')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="target.signatureType"
        :label="t('services.fields.signatureType')"
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="target.secretRef"
        :label="t('services.fields.secretRef')"
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
