<template>
  <q-page class="installation-page row items-center justify-center q-pa-md">
    <InstallationWizardComponent @configured="goToLogin" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import InstallationWizardComponent from 'src/components/installation/InstallationWizardComponent.vue';

const router = useRouter();

function goToLogin(): void {
  void router.replace({ name: 'login' });
}
</script>

<style scoped>
.installation-page {
  min-height: 100vh;
  background: #f3f7f7;
}
</style>