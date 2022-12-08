<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import LeafletMap from '@/components/maps/LeafletMap.vue'

const zoom = ref(7)
const center = ref({ lat: 47.86, lng: 14.28 })
</script>

<template>
  <aside class="bg-white basis-96 p-3 lg:p-4">
    <RouterView />
  </aside>

  <main class="grow">
    <LeafletMap
      v-model:zoom="zoom"
      v-model:center="center"
      class="h-full"
      :zoom-control="false"
    >
      <template #hasLoaded>
        <aside>it has loaded!</aside>
      </template>
    </LeafletMap>
  </main>
</template>

<style lang="scss" module>
</style>
