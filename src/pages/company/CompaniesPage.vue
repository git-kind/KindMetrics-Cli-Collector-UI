<template>
  <q-page class="companies-page q-pa-lg">
    <CompaniesManagementComponent @company-created="continueCompanySetup" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CompaniesManagementComponent from 'src/components/company/CompaniesManagementComponent.vue';

const router = useRouter();

function continueCompanySetup(companyId: string): void {
  void router.push({ name: 'installation', query: { companyId } });
}
</script>

<style scoped>
.companies-page {
  min-height: 100%;
}
</style>