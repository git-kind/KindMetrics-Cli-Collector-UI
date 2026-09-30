<template>
  <q-page class="company-page q-pa-lg">
    <CompanySelectComponent @select="selectCompany" @create="goToCreate" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuthorization';
import type { Company } from '../../models/company';
import CompanySelectComponent from '../../components/company/CompanySelectComponent.vue';

const router = useRouter();
const { setActiveCompany } = useAuth();

function selectCompany(company: Company): void {
  setActiveCompany(company);
  void router.replace({ name: 'dashboard' });
}

function goToCreate(): void {
  void router.push({ name: 'company-create' });
}
</script>

<style scoped>
.company-page {
  min-height: 100vh;
}
</style>