<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import LeafletMap from '@/components/maps/LeafletMap.vue'
import LeafletGeoJson from '@/components/maps/LeafletGeoJson.vue'

const geoJson = ref(undefined)
const geoJsonLabel = ref(undefined)
const zoom = ref(7)
const center = ref({ lat: 47.86, lng: 14.28 })
const layerStyle = ref({
  weight: 3,
  color: '#ff3300',
  opacity: 0.8,
  fillColor: null,
  fillOpacity: 0.18
})
</script>

<template>
  <aside class="bg-white basis-96 p-3 lg:p-4 overflow-y-scroll">
    <RouterView
      v-model:zoom="zoom"
      v-model:center="center"
      v-model:layerStyle="layerStyle"
      @update:geoJson="geoJson = $event"
      @update:geoJsonLabel="geoJsonLabel = $event"
    />
  </aside>

  <main class="grow">
    <LeafletMap
      v-model:zoom="zoom"
      v-model:center="center"
      class="h-full"
      :zoom-control="false"
    >
      <LeafletGeoJson
        v-if="geoJson"
        :json="geoJson"
        :layer-style="layerStyle"
      />
    </LeafletMap>
  </main>
</template>

<style lang="scss" module>
</style>
