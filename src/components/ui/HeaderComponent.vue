<template>
  <q-header elevated class="login-header">
    <q-toolbar class="login-header-toolbar">
      <div class="row items-center no-wrap q-gutter-sm">
        <img :src="kindLogo" alt="Kind Technologies logo" class="brand-logo" />
        <div>
          <div class="text-subtitle1 text-weight-bold text-on-surface">Kind Technologies</div>
          <div class="text-caption muted">ARM Carga Routing</div>
        </div>
      </div>

      <q-chip color="primary" text-color="white" icon="lock" dense>
        Secure Access
      </q-chip>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import kindLogo from 'src/assets/Kind-Logo.png';
</script>

<style scoped lang="scss">
.login-header {
  background: linear-gradient(90deg, var(--km-surface) 18%, var(--km-primary) 58%, var(--km-secondary) 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  color: var(--km-text);
}

.login-header-toolbar {
  min-height: 72px;
}

.brand-logo {
  width: 192px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
}

.text-on-surface {
  color: var(--km-text);
}
</style>
