<template>
  <q-drawer
    v-model="drawerModel"
    show-if-above
    bordered
    :class="dark ? 'bg-dark text-white' : 'bg-grey-1 text-primary'"
    :width="250"
  >
    <q-list padding>
      <q-item-label header>
        {{ t('nav.dashboards') }}
      </q-item-label>

      <q-item
        v-if="can('dashboard.view')"
        clickable
        to="/dashboard"
        exact
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>
        <q-item-section>
          {{ t('nav.overview') }}
        </q-item-section>
      </q-item>

      <q-item
        v-if="can('dashboard.view')"
        clickable
        to="/dashboards"
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="view_quilt" />
        </q-item-section>
        <q-item-section>
          {{ t('nav.allDashboards') }}
        </q-item-section>
      </q-item>

      <q-item
        clickable
        to="/explore"
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="explore" />
        </q-item-section>
        <q-item-section>{{ t('nav.explore') }}</q-item-section>
      </q-item>

      <q-separator class="q-my-md" />

      <q-expansion-item
        icon="monitor"
        :label="t('nav.monitoring')"
      >
        <q-item clickable to="/monitoring/metrics">
          <q-item-section avatar>
            <q-icon name="speed" />
          </q-item-section>
          <q-item-section>{{ t('nav.metrics') }}</q-item-section>
        </q-item>

        <q-item clickable to="/monitoring/events">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>{{ t('nav.events') }}</q-item-section>
        </q-item>

        <q-item clickable to="/monitoring/alerts">
          <q-item-section avatar>
            <q-icon name="notifications_active" />
          </q-item-section>
          <q-item-section>{{ t('nav.alerts') }}</q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        icon="settings"
        :label="t('nav.administration')"
      >
        <q-item clickable to="/admin/datasources">
          <q-item-section avatar>
            <q-icon name="storage" />
          </q-item-section>
          <q-item-section>{{ t('nav.datasources') }}</q-item-section>
        </q-item>

        <q-item clickable to="/admin/companies">
          <q-item-section avatar>
            <q-icon name="business" />
          </q-item-section>
          <q-item-section>{{ t('nav.companies') }}</q-item-section>
        </q-item>

        <q-item v-if="can('user.view')" clickable to="/admin/users">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>{{ t('nav.users') }}</q-item-section>
        </q-item>
      </q-expansion-item>
    </q-list>

    <div class="absolute-bottom q-pa-md text-caption muted">
      {{ t('app.version') }}
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthorization } from 'src/composables/useAuthorization';

const props = defineProps<{
  modelValue: boolean;
  dark: boolean;
  t: (key: string) => string;
}>();

const emit = defineEmits<{ (event: 'update:modelValue', value: boolean): void }>();

const drawerModel = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
});
const { can } = useAuthorization();
</script>
