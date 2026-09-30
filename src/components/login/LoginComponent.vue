<template>
  <q-card class="login-card">
    <div class="row q-col-gutter-none items-stretch">
      <div class="col-12 col-md-6 login-hero">
        <div class="brand-lockup q-mb-lg">
          <img :src="kindLogo" alt="Kind Technologies" class="brand-image" />
          <div>
            <div class="text-h5 text-weight-bold text-primary">Kind Technologies</div>
            <div class="text-body2 text-grey-7">{{ t('app.subtitle') }}</div>
          </div>
        </div>

        <div class="text-h4 text-weight-bold text-primary q-mb-sm">{{ t('auth.welcome') }}</div>
        <div class="text-body1 text-grey-7 q-mb-lg">
          {{ t('auth.welcomeMessage') }}
        </div>

        <q-list class="q-px-none">
          <q-item class="q-px-none q-mb-sm">
            <q-item-section avatar>
              <q-icon name="security" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ t('auth.security') }}</q-item-label>
              <q-item-label caption>{{ t('auth.securityDescription') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item class="q-px-none">
            <q-item-section avatar>
              <q-icon name="route" color="secondary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ t('auth.operation') }}</q-item-label>
              <q-item-label caption>{{ t('auth.operationDescription') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-12 col-md-6 login-form-panel">
        <div class="text-h5 text-weight-bold q-mb-md">{{ t('auth.signInTitle') }}</div>

        <q-form ref="formRef" class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="username"
            :label="t('auth.username')"
            outlined
            dense
            :rules="usernameRules"
            autocomplete="username"
          />

          <q-input
            v-model="password"
            :label="t('auth.password')"
            :type="isPasswordVisible ? 'text' : 'password'"
            outlined
            dense
            :rules="passwordRules"
            autocomplete="current-password"
          >
            <template #append>
              <q-icon
                :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
                :aria-label="t(isPasswordVisible ? 'auth.hidePassword' : 'auth.showPassword')"
                class="cursor-pointer"
                @click="isPasswordVisible = !isPasswordVisible"
              />
            </template>
          </q-input>

          <div class="row items-center justify-between">
            <q-checkbox v-model="rememberMe" :label="t('auth.rememberMe')" dense />
            <q-btn flat color="primary" :label="t('auth.forgotPassword')" />
          </div>

          <q-btn
            type="button"
            color="primary"
            class="full-width"
            size="lg"
            unelevated
            :label="t('auth.login')"
            @click="onSubmit"
          />
        </q-form>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import kindLogo from 'src/assets/Kind-Logo.png';
import { validateUsername, validatePassword } from 'src/helpers/login/loginHelper';
import { useAuth } from 'src/composables/useAuthorization';
import { installationService } from 'src/services/installation.service';
import { companyService } from 'src/services/company.service';

const $q = useQuasar();
const { t } = useI18n();
const router = useRouter();
const { login, setActiveCompany, clearActiveCompany, logout } = useAuth();
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isPasswordVisible = ref(false);
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);

const usernameRules = [
  (value: string) => validateUsername(value, t),
];

const passwordRules = [
  (value: string) => validatePassword(value, t),
];

async function onSubmit() {
  const isValid = await formRef.value?.validate();

  if (!isValid) {
    return;
  }

  const authenticated = await login(username.value.trim(), password.value);

  if (authenticated) {
    $q.notify({
      type: 'positive',
      message: t('auth.loginSuccess'),
      timeout: 1800,
    });

    const mode = await installationService.getMode();
    if (mode === 'KIND') {
      clearActiveCompany();
      await router.push({ name: 'company-select' });
      return;
    }

    const configuredCompanyId = await installationService.getConfiguredCompanyId();
    const companyRecord = configuredCompanyId
      ? await companyService.getCompany(configuredCompanyId)
      : (await companyService.listCompanies())[0] ?? null;
    if (!companyRecord) {
      logout();
      $q.notify({ type: 'negative', message: t('companyContext.contextMissing') });
      return;
    }
    const configuredDatabaseName = await installationService.getConfiguredDatabaseName();
    const customerCompany = configuredDatabaseName
      ? { ...companyRecord, databaseName: configuredDatabaseName }
      : companyRecord;
    setActiveCompany(customerCompany);
    await router.push({ name: 'dashboard' });
    return;
  }

  $q.notify({
    type: 'negative',
    message: t('auth.invalid'),
    timeout: 2200,
  });
}
</script>

<style scoped lang="scss">
.login-card {
  border-radius: 20px !important;
  overflow: hidden !important;
  background: #ffffff !important;
  box-shadow: 0 22px 70px rgba(3, 12, 32, 0.22), 0 0 0 1px rgba(14, 59, 103, 0.14) !important;
  border: 1px solid #b8d0ea !important;
}

.login-hero {
  background: #f8fbff;
  padding: 32px;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-image {
  width: 70px;
  height: auto;
}

.login-form-panel {
  padding: 32px;
  background: #ffffff;
}
</style>
