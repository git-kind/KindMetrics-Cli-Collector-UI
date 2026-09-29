<template>
  <q-header elevated class="login-header">
    <q-toolbar class="login-header-toolbar">
      <div class="row items-center no-wrap q-gutter-sm">
        <img :src="kindLogo" alt="Kind Technologies logo" class="brand-logo" />
        <div>
          <div class="text-subtitle1 text-weight-bold text-black">Kind Technologies</div>
          <div class="text-caption text-grey-8">ARM Carga Routing</div>
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
  background: linear-gradient(90deg, #ffffff 20%,  #d4e4ff 58%, #0e3b67 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.login-header-toolbar {
  min-height: 72px;
}

.brand-logo {
  width: 192px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
}
</style>
