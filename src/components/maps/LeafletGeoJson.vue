<script setup>
import { ref, inject, onBeforeMount, watch, onBeforeUnmount } from 'vue'
import { GeoJSON } from 'leaflet'

const props = defineProps({
  json: {
    type: Object,
    required: true
  },
  layerStyle: {
    type: Object,
    default: undefined
  },
  onEachFeature: {
    type: Function,
    default: undefined
  }
})
const getMap = inject('getMap')
let geoJsonLayer = ref(null)

function updateGeoJson() {
  const map = getMap()
  if (map) {
    geoJsonLayer.value = (new GeoJSON(props.json, {
      style: props.layerStyle,
      onEachFeature: props.onEachFeature
    })).addTo(map)
    map.fitBounds(geoJsonLayer.value.getBounds())
  }
}

function fitBounds() {
  const map = getMap()
  if (map) {
    map.fitBounds(geoJsonLayer.value.getBounds())
  }
}

defineExpose({ fitBounds })

onBeforeMount(() => {
  updateGeoJson()
})

onBeforeUnmount(() => {
  if (geoJsonLayer.value) {
    geoJsonLayer.value.remove()
  }
})

watch(() => props.json, (geoJson) => {
  geoJsonLayer.value = geoJson
})

watch(() => props.layerStyle, (style) => {
  geoJsonLayer.value.setStyle(style)
})
</script>

<script>
export default {
  render() {
    return null
  }
}
</script>
<style lang="scss">

</style>
