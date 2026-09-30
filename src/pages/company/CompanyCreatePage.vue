<template><div /></template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  void router.replace({ name: 'installation', query: { createCompany: '1' } });
});
</script>