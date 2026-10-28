<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-select
        :model-value="props.draft.authType"
        :options="authOptions"
        emit-value
        map-options
        :label="t('services.fields.authType')"
        outlined
        dense
        @update:model-value="onAuthTypeChange"
      />
    </div>
    <div
      v-if="props.draft.authType === 'API_KEY'"
      class="col-12 col-md-6"
    >
      <q-input
        :model-value="apiKeyName"
        :label="t('services.fields.apiKeyName')"
        outlined
        dense
        @update:model-value="apiKeyName = $event as string"
      />
    </div>
    <div
      v-if="props.draft.authType === 'BEARER' || props.draft.authType === 'OAUTH2'"
      class="col-12"
    >
      <q-input
        :model-value="tokenRef"
        :label="t('services.fields.tokenRef')"
        outlined
        dense
        @update:model-value="tokenRef = $event as string"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceAuthType, ServiceFormDraft } from 'src/models/services/Service';

const { t } = useI18n();
const props = defineProps<{ draft: ServiceFormDraft }>();
const emit = defineEmits<{ 'update:draft': [value: ServiceFormDraft] }>();

const apiKeyName = ref<string>(String(props.draft.connectionConfig?.apiKeyName ?? ''));
const tokenRef = ref<string>(String(props.draft.connectionConfig?.tokenRef ?? ''));

watch(
  () => props.draft.connectionConfig?.apiKeyName,
  (value) => {
    apiKeyName.value = String(value ?? '');
  },
  { immediate: true },
);

watch(
  () => props.draft.connectionConfig?.tokenRef,
  (value) => {
    tokenRef.value = String(value ?? '');
  },
  { immediate: true },
);

watch(apiKeyName, (value) => {
  emit('update:draft', {
    ...props.draft,
    connectionConfig: {
      ...(props.draft.connectionConfig ?? {}),
      apiKeyName: value,
    },
  });
}, { flush: 'sync' });

watch(tokenRef, (value) => {
  emit('update:draft', {
    ...props.draft,
    connectionConfig: {
      ...(props.draft.connectionConfig ?? {}),
      tokenRef: value,
    },
  });
}, { flush: 'sync' });

function onAuthTypeChange(value: ServiceAuthType): void {
  emit('update:draft', { ...props.draft, authType: value });
}

const authOptions = computed(() => [
  { label: 'None', value: 'NONE' },
  { label: 'Basic', value: 'BASIC' },
  { label: 'API Key', value: 'API_KEY' },
  { label: 'Bearer', value: 'BEARER' },
  { label: 'OAuth 2.0', value: 'OAUTH2' },
  { label: 'SNMP Community', value: 'SNMP_COMMUNITY' },
  { label: 'SNMPv3 USM', value: 'SNMPV3_USM' },
  { label: 'mTLS', value: 'MTLS' },
  { label: 'HMAC', value: 'HMAC' },
] as Array<{ label: string; value: ServiceAuthType }>);
</script>
