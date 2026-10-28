<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-select
        v-model="authAlgorithm"
        :options="authAlgorithms"
        emit-value
        map-options
        :label="t('services.fields.authAlgorithm')"
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
const authAlgorithm = ref('SHA-256');
const authAlgorithms = computed(() => [
  'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384', 'SHA-512',
]);
</script>
