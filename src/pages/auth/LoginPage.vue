<template>
  <q-page class="login-page row items-center justify-center">
    <div class="login-shell">
      <LoginComponent />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import LoginComponent from 'components/login/LoginComponent.vue';
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: #ffffff;
}

.login-shell {
  width: min(960px, calc(100vw - 32px));
}
</style>