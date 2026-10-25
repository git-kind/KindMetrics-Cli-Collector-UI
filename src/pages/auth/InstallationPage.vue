<template>
  <q-page class="installation-page row items-center justify-center q-pa-md">
    <InstallationFlowComponent />
  </q-page>
</template>

<script setup lang="ts">
import InstallationFlowComponent from 'src/components/installation/InstallationFlowComponent.vue';
</script>

<style scoped>
.installation-page {
  min-height: 100vh;
  background: #f3f7f7;
}
</style>