<template>
  <q-page class="entry-page row items-center justify-center q-pa-lg">
    <q-card flat bordered class="entry-card">
      <header class="entry-brand">
        <img :src="kindLogo" alt="Kind Technologies" class="entry-logo" />
        <div>
          <div class="text-subtitle1 text-weight-bold">Kind Technologies</div>
          <div class="text-caption km-muted">{{ t('app.title') }}</div>
        </div>
      </header>

      <div class="entry-heading">
        <h1>{{ t('installation.mode.accessTitle') }}</h1>
        <p>{{ t('installation.mode.accessDescription') }}</p>
      </div>

      <section class="mode-option">
        <div>
          <h2>{{ t('installation.mode.customer') }}</h2>
          <p>{{ t('installation.mode.customerDescription') }}</p>
        </div>
        <q-btn
          color="primary"
          unelevated
          icon-right="arrow_forward"
          :label="t('installation.mode.customerAction')"
          @click="enterMode('CUSTOMER')"
        />
      </section>

      <q-separator />

      <section class="mode-option">
        <div>
          <h2>{{ t('installation.mode.kind') }}</h2>
          <p>{{ t('installation.mode.kindDescription') }}</p>
        </div>
        <q-btn
          color="primary"
          unelevated
          icon-right="arrow_forward"
          :label="t('installation.mode.kindAction')"
          @click="enterMode('KIND')"
        />
      </section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import kindLogo from 'src/assets/Kind-Logo.png';
import { useAuth } from 'src/composables/useAuthorization';
import type { InstallationMode } from 'src/models/installation';
import { installationService } from 'src/services/installation.service';

const { t } = useI18n();
const router = useRouter();
const { clearActiveCompany } = useAuth();

async function enterMode(mode: InstallationMode): Promise<void> {
  await installationService.setMode(mode);
  clearActiveCompany();

  if (mode === 'KIND') {
    await router.replace({ name: 'login' });
    return;
  }

  const status = await installationService.getStatus();
  await router.replace({ name: status === 'CONFIGURED' ? 'login' : 'installation' });
}
</script>

<style scoped>
.entry-page {
  min-height: 100vh;
}

.entry-card {
  width: min(680px, 100%);
  padding: 28px;
}

.entry-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.entry-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.entry-heading {
  margin: 32px 0 20px;
}

.entry-heading h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.entry-heading p,
.mode-option p {
  margin: 0;
  color: var(--km-muted);
}

.mode-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 0;
}

.mode-option h2 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
}

@media (max-width: 600px) {
  .entry-card {
    padding: 22px 18px;
  }

  .mode-option {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
  }
}
</style>