<template>
  <q-page class="km-login-page flex flex-center q-pa-md">
    <q-card flat class="km-login-card q-pa-xl">
      <div class="text-center">
        <img src="/kind-logo.png" alt="Kind Technologies" class="km-login-logo" />
        <div class="text-h5 text-weight-bold q-mt-md">{{ t('auth.title') }}</div>
        <div class="km-muted q-mt-xs">{{ t('auth.subtitle') }}</div>
      </div>

      <q-form class="q-mt-xl" @submit.prevent="submit">
        <q-input v-model="username" dark outlined :label="t('auth.username')" class="q-mb-md" />
        <q-input
          v-model="password"
          dark
          outlined
          :label="t('auth.password')"
          type="password"
          class="q-mb-md"
        />
        <q-banner v-if="error" dense rounded class="bg-negative text-white q-mb-md">
          {{ t('auth.invalid') }}
        </q-banner>
        <q-btn
          unelevated
          no-caps
          type="submit"
          color="primary"
          class="full-width"
          :label="t('auth.login')"
        />
      </q-form>

      <div class="text-caption text-center km-muted q-mt-lg">{{ t('auth.demo') }}</div>

      <div class="row justify-center q-gutter-sm q-mt-md">
        <q-btn flat dense label="ES" @click="setLanguage('es')" />
        <q-btn flat dense label="EN" @click="setLanguage('en')" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useUi } from '../../composables/useUi';

const { t } = useI18n();
const router = useRouter();
const { login } = useAuth();
const { setLanguage } = useUi();
const username = ref('admin');
const password = ref('admin123');
const error = ref(false);

async function submit() {
  error.value = !(await login(username.value, password.value));
  if (!error.value) await router.replace({ name: 'dashboard' });
}
</script>

<style scoped>
.km-login-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, var(--km-secondary), var(--km-background) 55%);
}

.km-login-card {
  width: min(420px, 100%);
  background: var(--km-surface);
  border: 1px solid var(--km-border);
  color: var(--km-text);
}

.km-login-logo {
  width: 82px;
  height: auto;
}
</style>
