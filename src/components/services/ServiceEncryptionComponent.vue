<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-select
        v-model="privacyAlgorithm"
        :options="privacyAlgorithms"
        emit-value
        map-options
        :label="t('services.fields.privacyAlgorithm')"
        outlined
        dense
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const privacyAlgorithm = ref('AES-256');
const privacyAlgorithms = computed(() => ['AES-128', 'AES-192', 'AES-256', 'DES']);
</script>
