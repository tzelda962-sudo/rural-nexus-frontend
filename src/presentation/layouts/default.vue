<template>
  <div class="min-h-screen flex flex-col font-body bg-surface text-on-surface">
    <NuxtLoadingIndicator color="#4ade80" :height="3" />
    <GlobalHeader />

    <main class="flex-grow">
      <slot />
    </main>

    <GlobalFooter />
  </div>
</template>

<script setup>
</script>
