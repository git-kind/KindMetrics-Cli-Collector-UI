<template>
  <q-layout view="lHh Lpr lFf" class="login-layout">
    <q-page-container>
      <q-page class="login-layout-page">
        <div class="login-layout-container">
          <router-view />
        </div>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<style scoped lang="scss">
.login-layout {
  min-height: 100vh;
}

.login-layout-page {
  background: #ffffff;
}

.login-layout-container {
  min-height: calc(100vh - 112px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #ffffff;
  border-radius: 0;
}
</style>
