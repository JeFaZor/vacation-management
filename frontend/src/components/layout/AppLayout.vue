<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-alpine-bg">
    <AppHeader />
    <main class="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <slot />
    </main>
  </div>
</template>
