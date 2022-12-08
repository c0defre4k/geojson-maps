<script setup>
import { ref, computed, useCssModule, watch, nextTick } from 'vue'
import { RouterView } from 'vue-router'
import centerOfMass from '@turf/center-of-mass'
import PagePreview from '@/components/PagePreview.vue'
import LeafletMap from '@/components/maps/LeafletMap.vue'
import LeafletGeoJson from '@/components/maps/LeafletGeoJson.vue'
import LeafletMarker from '@/components/maps/LeafletMarker.vue'

const map = ref()
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
        iconSize: [4 + 6 * feature.properties[geoJsonLabel.value].length, 15]
      },
      coords: centerOfMass(feature).geometry.coordinates.reverse()
    }))
})

watch(pageSize, () => {
  nextTick(() => {
    map.value.update()
  })
})
watch(pageMargin, () => {
  nextTick(() => {
    map.value.update()
  })
})
</script>

<template>
  <aside class="bg-white w-96 shrink-0 p-3 lg:p-4 overflow-y-scroll print:hidden">
    <RouterView
      v-model:zoom="zoom"
      v-model:center="center"
      v-model:layerStyle="layerStyle"
      v-model:pageSize="pageSize"
      v-model:pageMargin="pageMargin"
      @update:geoJson="geoJson = $event"
      @update:geoJsonLabel="geoJsonLabel = $event"
    />
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
  font-size: 0.625rem;
  white-space: normal;
  overflow: hidden;
  background-color: var(--fillColor, red);
}
</style>
