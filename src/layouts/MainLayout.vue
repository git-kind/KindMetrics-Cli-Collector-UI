<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="km-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />
        <img :src="company.logo" alt="KindMetrics" class="km-logo" />
        <div class="km-brand">
          <div class="text-subtitle1 text-weight-bold">{{ t('app.title') }}</div>
          <div class="text-caption km-muted">{{ t('app.subtitle') }}</div>
        </div>
        <q-space />
        <q-btn flat no-caps :label="company.name" icon="business">
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ t('common.company') }}</q-item-label>
                  <q-item-label>{{ company.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense :label="locale.toUpperCase()">
          <q-menu>
            <q-list>
              <q-item v-close-popup clickable @click="setLanguage('es')">
                <q-item-section>Español</q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="setLanguage('en')">
                <q-item-section>English</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense round icon="palette">
          <q-menu>
            <q-list>
              <q-item
                v-for="skinOption in skinOptions"
                :key="skinOption.id"
                v-close-popup
                clickable
                @click="applySkin(skinOption.id)"
              >
                <q-item-section>{{ t(skinOption.nameKey) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense round icon="settings" :to="{ name: 'settings' }" />
        <q-btn flat dense round icon="account_circle">
          <q-menu>
            <q-list>
              <q-item>
                <q-item-section>{{ username }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable @click="logout">
                <q-item-section>{{ t('common.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" bordered :width="230" class="km-drawer">
      <q-list padding>
        <q-item
          v-for="item in menuItems"
          :key="item.route"
          clickable
          :to="{ name: item.route }"
          active-class="km-active"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ t(item.label) }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useUi } from '../composables/useUi';
import { skins } from '../themes/skins';

const { t, locale } = useI18n();
const router = useRouter();
const { company, username, logout: signOut } = useAuth();
const { applySkin, setLanguage } = useUi();
const drawer = ref(true);
const skinOptions = Object.values(skins);

const menuItems = [
  { route: 'dashboard', label: 'menu.dashboard', icon: 'dashboard' },
  { route: 'equipment', label: 'menu.equipment', icon: 'dns' },
  { route: 'origins', label: 'menu.origins', icon: 'source' },
  { route: 'extraction-methods', label: 'menu.extractionMethods', icon: 'api' },
  { route: 'collectors', label: 'menu.collectors', icon: 'sync_alt' },
  { route: 'mappings', label: 'menu.mappings', icon: 'account_tree' },
  { route: 'storage', label: 'menu.storage', icon: 'storage' },
  { route: 'settings', label: 'menu.settings', icon: 'settings' },
];

function logoutAndRedirect() {
  signOut();
  router.replace({ name: 'login' });
}

// Keep the handler explicit so the template remains presentation-focused.
const logout = logoutAndRedirect;
</script>
