<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="alert fixed-top"
      :class="`alert-${type}`"
      role="alert"
      style="z-index: 1000"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  message: string;
  type: string;
}>();
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
