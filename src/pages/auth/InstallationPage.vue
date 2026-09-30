<template>
  <q-page class="installation-page row items-center justify-center q-pa-md">
    <InstallationWizardComponent @configured="finishInstallation" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from 'src/composables/useAuthorization';
import InstallationWizardComponent from 'src/components/installation/InstallationWizardComponent.vue';
import { companyService } from 'src/services/company.service';

const router = useRouter();
const { setActiveCompany } = useAuth();

async function finishInstallation(mode: 'CUSTOMER' | 'KIND', companyId?: string): Promise<void> {
  if (mode === 'KIND' && companyId) {
    const company = await companyService.getCompany(companyId);
    if (company) {
      setActiveCompany(company);
      await router.replace({ name: 'dashboard' });
      return;
    }
    await router.replace({ name: 'company-select' });
    return;
  }
  await router.replace({ name: 'login' });
}
</script>

<style scoped>
.installation-page {
  min-height: 100vh;
  background: #f3f7f7;
}
</style>