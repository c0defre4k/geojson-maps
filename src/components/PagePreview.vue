<template>
  <div
    ref="view"
    class="overflow-scroll flex justify-center align-middle"
  >
    <div
      ref="page"
      :class="[$style.page, 'shrink-0']"
      :style="cssVariables"
    >
      <slot/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as pageSizes from '@/constants/pageSizes'

const props = defineProps({
  size: {
    type: String,
    default: 'A4'
  },
  margin: {
    type: Number,
    default: 0
  }
})

const view = ref()
const page = ref()
const elementWidth = ref(0)
const elementHeight = ref(0)
const dpi = 96

function calcScale(width, height) {
  if (!elementWidth.value || !elementHeight.value) {
    return 1
  }

  return Math.min(
    1,
    elementWidth.value / (width / 25.4 * dpi),
    elementHeight.value / (height / 25.4 * dpi)
  )
}

const cssVariables = computed(() => {
  const [pageWidth, pageHeight] = pageSizes[props.size]

  return `
      --page-width: ${pageWidth}mm;
      --page-height: ${pageHeight}mm;
      --page-margin: ${props.margin}cm;
      --page-scale: ${calcScale(pageWidth, pageHeight)};
      `
})

function updateElementDimensions() {
  requestAnimationFrame(() => {
    const { width, height } = view.value.getBoundingClientRect()
    elementWidth.value = width
    elementHeight.value = height

    nextTick(() => {
      page.value.scrollIntoView(true)
    })
  })
}

onMounted(() => {
  updateElementDimensions()

  window.addEventListener('resize', updateElementDimensions)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateElementDimensions)
})

watch(() => props.size, updateElementDimensions)
</script>

<style lang="scss" module>
@page {
  margin: 0;
}

.page {
  width: var(--page-width, 420mm);
  height: var(--page-height, 594mm);
  padding: var(--page-margin, 0);
  background-color: white;
}

@media screen {
  .page {
    transform: scale(var(--page-scale, 1));
    transform-origin: 50% 50%;
  }
}
</style>
