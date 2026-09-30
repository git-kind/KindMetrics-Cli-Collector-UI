<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUi } from './composables/useUi';

const { applySkin } = useUi();

onMounted(() => {
  applySkin('light');
});
</script>
