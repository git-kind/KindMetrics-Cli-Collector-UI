<template>
  <q-layout view="hHh Lpr fFf">
    <AppHeaderComponent
      :dark="ui.dark.value"
      :locale="locale"
      :langs="langs"
      :t="t"
      @toggle-drawer="drawer = !drawer"
      @toggle-dark="ui.toggleDark()"
      @change-lang="changeLang"
      @logout="logout"
    />

    <AppMenuComponent
      :model-value="drawer"
      :dark="ui.dark.value"
      :t="t"
      @update:model-value="drawer = $event"
    />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUi } from 'src/composables/useUi';
import AppHeaderComponent from 'src/components/ui/AppHeaderComponent.vue';
import AppMenuComponent from 'src/components/ui/AppMenuComponent.vue';
import { useAuth } from 'src/composables/useAuthorization';
import { useRouter } from 'vue-router';

const { t, locale: i18nLocale } = useI18n();
const $q = useQuasar();
const ui = useUi();
const drawer = ref(true);
const locale = ref(ui.locale);
const langs = [{ label: 'ES', value: 'es' }, { label: 'EN', value: 'en' }];
const router = useRouter();
const { logout: signOut } = useAuth();

function changeLang(v: string) {
  i18nLocale.value = v;
  ui.setLocale(v);
}

function logout(): void {
  signOut();
  void router.replace({ name: 'login' });
}

watch(() => ui.dark.value, value => $q.dark.set(value), { immediate: true });
</script>