<template>
  <div>
    <div v-if="draft.type === 'SNMP'">
      <SnmpConnectionComponent :draft="draft" />
    </div>
    <div v-else-if="draft.type === 'REST_API'">
      <ApiConnectionComponent :draft="draft" />
    </div>
    <div v-else-if="draft.type === 'MICROSOFT_TEAMS' || draft.type === 'MICROSOFT_OUTLOOK'">
      <MicrosoftGraphConnectionComponent :draft="draft" />
    </div>
    <div v-else-if="draft.type === 'WEBEX'">
      <WebexConnectionComponent :draft="draft" />
    </div>
    <div v-else-if="draft.type === 'ZOOM'">
      <ZoomConnectionComponent :draft="draft" />
    </div>
    <div v-else-if="draft.type === 'WEBHOOK'">
      <WebhookConnectionComponent :draft="draft" />
    </div>
    <div v-else>
      <q-banner
        rounded
        class="bg-grey-2 text-grey-8"
      >
        {{ t('services.connection.selectType') }}
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ServiceFormDraft } from 'src/models/services/Service';
import SnmpConnectionComponent from './connections/SnmpConnectionComponent.vue';
import ApiConnectionComponent from './connections/ApiConnectionComponent.vue';
import MicrosoftGraphConnectionComponent from './connections/MicrosoftGraphConnectionComponent.vue';
import WebexConnectionComponent from './connections/WebexConnectionComponent.vue';
import ZoomConnectionComponent from './connections/ZoomConnectionComponent.vue';
import WebhookConnectionComponent from './connections/WebhookConnectionComponent.vue';

const { t } = useI18n();
defineProps<{ draft: ServiceFormDraft }>();
</script>
