<script setup>
import { ref, computed, useCssModule, watch, nextTick } from 'vue'
import { RouterView } from 'vue-router'
import centerOfMass from '@turf/center-of-mass'
import PagePreview from '@/components/PagePreview.vue'
import LeafletMap from '@/components/maps/LeafletMap.vue'
import LeafletGeoJson from '@/components/maps/LeafletGeoJson.vue'
import LeafletMarker from '@/components/maps/LeafletMarker.vue'

const map = ref()
const geoJsonLayer = ref()
const geoJson = ref(undefined)
const geoJsonLabel = ref(undefined)
const zoom = ref(7)
const center = ref({ lat: 47.86, lng: 14.28 })
const layerStyle = ref({
  weight: 3,
  color: '#ff3300',
  opacity: 0.8,
  fillColor: null,
  fillOpacity: 0
})
const pageSize = ref('A4')
const pageMargin = ref(0)
const $style = useCssModule()

const markers = computed(() => {
  if (!geoJson.value || !geoJsonLabel.value) {
    return []
  }

  return geoJson.value.features
    .filter((feature) => feature.geometry.type === 'Polygon')
    .map((feature, i) => ({
      id: feature.properties.name || feature.properties[geoJsonLabel.value],
      icon: {
        html: feature.properties[geoJsonLabel.value] || i,
        className: `${$style.marker} font-xxs font-bold p-0.5 rounded text-white leading-none text-center`,
        clickable: false,
        keyboard: false,
        opacity: layerStyle.value.opacity,
        iconSize: [6 + Math.ceil(6.4 * feature.properties[geoJsonLabel.value].trim().length), 16]
      },
      coords: centerOfMass(feature).geometry.coordinates.reverse()
    }))
})


function updateMap() {
  nextTick(() => {
    map.value.update()
    geoJsonLayer.value.fitBounds()
  })
}

watch(pageSize, updateMap)
watch(pageMargin, updateMap)
</script>

<template>
  <aside class="bg-white dark:bg-gray-800 dark:text-white w-96 shrink-0 p-3 lg:p-4 overflow-y-scroll print:hidden">
    <RouterView
      v-model:zoom="zoom"
      v-model:center="center"
      v-model:layerStyle="layerStyle"
      v-model:pageSize="pageSize"
      v-model:pageMargin="pageMargin"
      v-model:geo-json-label="geoJsonLabel"
      @update:geo-json="geoJson = $event"
    />

    <div class="mt-5">
      <small>Datenquelle: <a href="https://basemap.at/">basemap.at</a></small>
    </div>
  </aside>

  <PagePreview
    class="grow"
    :size="pageSize"
    :margin="pageMargin"
  >
    <LeafletMap
      ref="map"
      v-model:zoom="zoom"
      v-model:center="center"
      class="h-full"
      :scroll-wheel-zoom="false"
      :attribution-control="false"
      :zoom-control="false"
      :style="`--fillColor: ${layerStyle.color}`"
    >
      <LeafletGeoJson
        v-if="geoJson"
        ref="geoJsonLayer"
        :json="geoJson"
        :layer-style="layerStyle"
      />
      <LeafletMarker
        v-for="marker in markers"
        :key="marker.id"
        v-bind="marker"
      />
    </LeafletMap>
  </PagePreview>
</template>

<style lang="scss" module>
.marker {
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  background-color: var(--fillColor, red);
}
</style>
