<template>
  <InstallationWizardComponent @configured="finishInstallation" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from 'src/composables/useAuthorization';
import type { InstallationMode } from 'src/models/installation';
import { companyService } from 'src/services/company.service';
import InstallationWizardComponent from './InstallationWizardComponent.vue';

const router = useRouter();
const { setActiveCompany } = useAuth();

async function finishInstallation(mode: InstallationMode, companyId?: string): Promise<void> {
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