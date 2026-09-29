<template>
  <q-header
    bordered
    :class="dark ? 'bg-dark text-white' : 'bg-white text-primary'"
  >
    <q-toolbar>
      <q-btn
        flat
        round
        icon="menu"
        @click="$emit('toggle-drawer')"
      />

      <div class="brand-wrap q-ml-md">
        <img :src="kindLogo" alt="Kind Technologies logo" class="header-logo" />
        <div>
          <b>{{ t('app.name') }}</b>
          <div class="text-caption muted">
            {{ t('app.subtitle') }}
          </div>
        </div>
      </div>

      <q-space />

      <q-select
        v-if="companies && companies.length > 0"
        :model-value="currentCompanyId"
        :options="companies"
        dense
        outlined
        emit-value
        map-options
        option-label="name"
        option-value="id"
        :label="t('context.company')"
        style="min-width: 180px"
        @update:model-value="$emit('change-company', $event)"
      />

      <q-select
        :model-value="locale"
        :options="langs"
        dense
        borderless
        emit-value
        map-options
        style="width:90px"
        @update:model-value="value => $emit('change-lang', value)"
      />

      <q-btn
        flat
        round
        icon="dark_mode"
        @click="$emit('toggle-dark')"
      />

      <q-btn
        flat
        round
        icon="settings"
      />

      <q-btn
        flat
        round
        icon="account_circle"
      >
        <q-menu>
          <q-list style="min-width:180px">
            <q-item v-close-popup clickable>
              <q-item-section>{{ t('userMenu.profile') }}</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="$emit('logout')">
              <q-item-section>{{ t('userMenu.preferences') }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-close-popup clickable>
              <q-item-section>
                {{ t('userMenu.logout') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import kindLogo from 'src/assets/Kind-Logo.png';

type Lang = {
  label: string;
  value: string;
};

const props = defineProps<{
  locale: string;
  langs: Lang[];
  dark: boolean;
  t: (key: string) => string;
  companies?: Array<{ id: number; name: string }>;
  currentCompanyId?: number | null;
}>();

defineEmits<{
  (event: 'toggle-drawer'): void;
  (event: 'toggle-dark'): void;
  (event: 'change-lang', value: string): void;
  (event: 'change-company', value: number): void;
  (event: 'logout'): void;
}>();

void props;
</script>

<style scoped>
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 6px rgba(17, 47, 72, 0.18));
}
</style>
