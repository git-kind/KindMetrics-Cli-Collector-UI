<template>
  <q-layout view="hHh Lpr fFf">
    <AppHeaderComponent
      :dark="ui.dark.value"
      :locale="locale"
      :langs="langs"
      :t="t"
      :companies="availableCompanies"
      :current-company-id="currentCompanyId"
      @toggle-drawer="drawer = !drawer"
      @toggle-dark="ui.toggleDark()"
      @change-lang="changeLang"
      @change-company="changeCompany"
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
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUi } from 'src/composables/useUi';
import AppHeaderComponent from 'src/components/ui/AppHeaderComponent.vue';
import AppMenuComponent from 'src/components/ui/AppMenuComponent.vue';
import { clearSession, setCurrentCompany, useSession } from 'src/services/session/sessionService';
import { useRouter } from 'vue-router';

const { t, locale: i18nLocale } = useI18n();
const $q = useQuasar();
const ui = useUi();
const drawer = ref(true);
const locale = ref(ui.locale);
const langs = [{ label: 'ES', value: 'es' }, { label: 'EN', value: 'en' }];
const router = useRouter();
const { currentCompanyId } = useSession();
const availableCompanies = ref<Array<{ id: number; name: string }>>([]);

function changeLang(v: string) {
  i18nLocale.value = v;
  ui.setLocale(v);
}

function changeCompany(companyId: number): void {
  setCurrentCompany(companyId);
}

function logout(): void {
  clearSession();
  void router.push('/login');
}

onMounted(async () => {

});

watch(() => ui.dark.value, value => $q.dark.set(value), { immediate: true });
</script>