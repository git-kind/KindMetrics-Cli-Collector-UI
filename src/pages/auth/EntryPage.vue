<template>
  <q-page class="entry-page row items-center justify-center q-pa-lg">
    <EntryComponent @mode-selected="navigateToMode" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import EntryComponent from 'src/components/login/EntryComponent.vue';

const router = useRouter();

function navigateToMode(destination: 'login' | 'installation'): void {
  void router.replace({ name: destination });
}
</script>

<style scoped>
.entry-page {
  min-height: 100vh;
}
</style>