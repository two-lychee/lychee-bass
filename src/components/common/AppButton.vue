<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'medium',
    disabled: false,
  },
)
</script>

<template>
  <button class="app-button" :class="[variant, size]" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-family: inherit;
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.primary {
  background: #ff8a65;
  color: #fff;
}

.primary:hover:not(:disabled) {
  background: #ff7043;
}

.secondary {
  background: #fff;
  color: #333;
  border: 1px solid #e0e0e0;
}

.secondary:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.ghost {
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
}

.ghost:hover:not(:disabled) {
  background: #f5f5f5;
}

.small {
  padding: 4px 12px;
  font-size: 12px;
}

.medium {
  padding: 8px 16px;
  font-size: 14px;
}

.large {
  padding: 12px 24px;
  font-size: 16px;
}
</style>
