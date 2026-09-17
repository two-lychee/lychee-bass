<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
</script>

<template>
  <UApp>
    <AppLayout>
      <RouterView />
    </AppLayout>
  </UApp>
</template>
