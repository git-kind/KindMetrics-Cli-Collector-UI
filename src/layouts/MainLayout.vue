<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="km-header"
      :class="{ 'km-header--light': currentSkin.id === 'light' }"
      :style="{
        background: currentSkin.id === 'light'
          ? `linear-gradient(90deg, ${currentSkin.surface} 0%, ${currentSkin.surface} 28%, ${currentSkin.secondary} 100%)`
          : currentSkin.secondary,
        color: currentSkin.text,
      }"
    >
      <q-toolbar>
        <q-btn class="km-header-leading-btn" flat dense round icon="menu" @click="mini = !mini" />
        <img v-if="company" :src="company.logo" alt="KindMetrics" class="km-logo" />
        <div class="km-brand">
          <div class="km-brand-title">{{ t('app.title') }}</div>
          <div class="text-caption km-muted">{{ t('app.subtitle') }}</div>
        </div>
        <q-space />
        <div class="km-header-actions">
        <q-btn
          class="km-company-context"
          flat
          no-caps
          :label="`${t('companyContext.currentlyManaging')}: ${company?.name ?? ''}`"
          icon="business"
        >
            <q-menu
              dark
              content-class="km-header-menu"
              :content-style="{
                backgroundColor: currentSkin.surface,
                color: currentSkin.text,
                border: `1px solid ${currentSkin.border}`,
              }"
            >
            <q-list style="min-width: 180px">
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ t('common.company') }}</q-item-label>
                  <q-item-label>{{ company?.name ?? '' }}</q-item-label>
                </q-item-section>
              </q-item>
              <template v-if="installationMode === 'KIND'">
                <q-separator />
                <q-item v-close-popup clickable :to="{ name: 'company-select' }">
                  <q-item-section>{{ t('companyContext.switchCompany') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense :label="locale.toUpperCase()">
          <q-menu
            dark
            content-class="km-language-menu"
            :content-style="{
              backgroundColor: currentSkin.surface,
              color: currentSkin.text,
              border: `1px solid ${currentSkin.border}`,
            }"
          >
            <q-list
              class="km-language-list"
              :style="{ backgroundColor: currentSkin.surface, color: currentSkin.text }"
            >
              <q-item
                v-close-popup
                clickable
                :style="{ color: currentSkin.text }"
                @click="setLanguage('es')"
              >
                <q-item-section>Español</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                :style="{ color: currentSkin.text }"
                @click="setLanguage('en')"
              >
                <q-item-section>English</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense round icon="palette">
            <q-menu
              dark
              content-class="km-header-menu"
              :content-style="{
                backgroundColor: currentSkin.surface,
                color: currentSkin.text,
                border: `1px solid ${currentSkin.border}`,
              }"
            >
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
            <q-menu
              dark
              content-class="km-header-menu"
              :content-style="{
                backgroundColor: currentSkin.surface,
                color: currentSkin.text,
                border: `1px solid ${currentSkin.border}`,
              }"
            >
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
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :width="260"
      :mini-width="64"
      :mini="mini"
      class="km-drawer"
      :style="{ backgroundColor: currentSkin.surface, color: currentSkin.text }"
    >
      <q-list padding>
        <q-item
          clickable
          :to="{ name: 'dashboard' }"
          exact
          active-class="km-active"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>{{ t('menu.dashboard') }}</q-item-section>
          <q-tooltip>{{ t('menu.dashboard') }}</q-tooltip>
        </q-item>

        <q-item clickable :to="{ name: 'extraction-methods' }" active-class="km-active">
          <q-item-section avatar><q-icon name="cable" /></q-item-section>
          <q-item-section>{{ t('menu.extractionMethods') }}</q-item-section>
          <q-tooltip>{{ t('menu.extractionMethods') }}</q-tooltip>
        </q-item>

        <q-item clickable :to="{ name: 'collectors' }" active-class="km-active">
          <q-item-section avatar><q-icon name="sync_alt" /></q-item-section>
          <q-item-section>{{ t('menu.collectors') }}</q-item-section>
          <q-tooltip>{{ t('menu.collectors') }}</q-tooltip>
        </q-item>

        <q-item clickable :to="{ name: 'storage' }" active-class="km-active">
          <q-item-section avatar><q-icon name="storage" /></q-item-section>
          <q-item-section>{{ t('menu.storage') }}</q-item-section>
          <q-tooltip>{{ t('menu.storage') }}</q-tooltip>
        </q-item>

        <q-expansion-item icon="settings" :label="t('menu.configuration')">
          <q-item clickable :to="{ name: 'settings' }" active-class="km-active" class="q-pl-xl">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>{{ t('menu.settings') }}</q-item-section>
          </q-item>
          <q-tooltip>{{ t('menu.configuration') }}</q-tooltip>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuthorization';
import { useUi } from '../composables/useUi';
import type { InstallationMode } from '../models/installation';
import { installationService } from '../services/installation.service';
import { skins } from '../themes/skins';

const { t, locale } = useI18n();
const router = useRouter();
const { company, username, logout: signOut, restore } = useAuth();
const { applySkin, currentSkin, setLanguage } = useUi();
const installationMode = ref<InstallationMode | null>(null);
const drawer = ref(true);
const mini = ref(false);
const skinOptions = Object.values(skins);

onMounted(async () => {
  restore();
  installationMode.value = await installationService.getMode();
});

function logoutAndRedirect() {
  signOut();
  router.replace({ name: 'login' });
}

// Keep the handler explicit so the template remains presentation-focused.
const logout = logoutAndRedirect;
</script>

<style scoped lang="scss">
.km-header {
  background: var(--km-secondary);
  color: var(--km-text);
  border-bottom: 1px solid var(--km-border);
}

.km-header :deep(.q-btn) {
  color: var(--km-text);
}

.km-header :deep(.q-toolbar) {
  position: relative;
  min-height: 84px;
  padding: 0 24px;
}

.km-header--light .km-header-leading-btn,
.km-header--light .km-brand {
  color: #17272d;
}

.km-brand {
  position: absolute;
  left: 50%;
  max-width: min(40vw, 420px);
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  transform: translateX(-50%);
  white-space: nowrap;
}

.km-brand-title {
  color: var(--km-primary);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.km-header:not(.km-header--light) .km-brand-title {
  color: var(--km-text);
}

.km-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.km-header-actions :deep(.q-btn) {
  color: #ffffff;
}

.km-header-actions :deep(.km-company-context) {
  max-width: clamp(180px, 25vw, 320px);
}

.km-header-actions :deep(.km-company-context .q-btn__content) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.km-logo {
  width: 56px;
  height: 56px;
  margin-left: 12px;
  border: 0;
  outline: 0;
  box-shadow: none;
  background: transparent;
  object-fit: contain;
}

@media (max-width: 600px) {
  .km-header :deep(.q-toolbar) {
    min-height: 68px;
    padding: 0 12px;
  }

  .km-logo {
    width: 46px;
    height: 46px;
  }

  .km-header-actions :deep(.km-company-context) {
    max-width: 150px;
  }

  .km-brand {
    max-width: calc(100vw - 220px);
  }
}

.km-drawer {
  background: var(--km-surface);
  color: var(--km-text);
  border-right: 1px solid var(--km-border);
}

.km-drawer :deep(.q-item),
.km-drawer :deep(.q-expansion-item__container) {
  color: var(--km-text);
}

.km-drawer :deep(.q-item:hover),
.km-drawer :deep(.q-expansion-item__container:hover) {
  background: color-mix(in srgb, var(--km-primary) 18%, transparent);
}

.km-drawer :deep(.km-active) {
  background: var(--km-primary);
  color: #ffffff;
}

.km-drawer :deep(.q-expansion-item__content) {
  background: color-mix(in srgb, var(--km-background) 45%, var(--km-surface));
}

.q-page-container {
  background: var(--km-background);
}

:global(.km-language-menu) {
  background: var(--km-surface);
  border: 1px solid var(--km-border);
  color: var(--km-text);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

:global(.km-language-menu .q-item) {
  color: var(--km-text);
}

:global(.km-language-menu .q-item__section) {
  color: var(--km-text);
}

:global(.km-language-menu .q-item:hover) {
  background: var(--km-primary);
  color: #ffffff;
}

:global(.km-language-list) {
  background: transparent;
  color: inherit;
  min-width: 140px;
}

:global(.km-header-menu) {
  min-width: 180px;
  background: var(--km-surface);
  border: 1px solid var(--km-border);
  color: var(--km-text);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

:global(.km-header-menu .q-item),
:global(.km-header-menu .q-item__section),
:global(.km-header-menu .q-item__label) {
  color: var(--km-text);
}

:global(.km-header-menu .q-item:hover) {
  background: var(--km-primary);
  color: #ffffff;
}
</style>
