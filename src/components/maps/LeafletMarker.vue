<script setup>
import { useAttrs, inject, unref, onBeforeMount, watch, onBeforeUnmount } from 'vue'
import { Marker, DivIcon } from 'leaflet'

const props = defineProps({
  coords: {
    type: [Object, Array],
    required: true
    // @todo: validate for { lat: 0, lng: 0 }
  },
  draggable: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Object,
    default: undefined
  }
})
const getMap = inject('getMap')
const emit = defineEmits(['change'])
const attrs = useAttrs()
const listeners = Object.entries(attrs)
  .filter(([name]) => /^on/.test(name))
  .reduce((acc, [name, fnc]) => {
    acc[name.slice(2, 3).toLocaleLowerCase() + name.slice(3)] = fnc
    return acc
  }, {})
let marker

function toLatLng(coords) {
  if (coords instanceof Array) {
    return coords
  }
  return [coords.lat, coords.lng || coords.lon]
}

onBeforeMount(() => {
  const map = getMap()
  const {
    coords,
    icon,
    draggable,
    ...options
  } = props

  if (icon) {
    options.icon = icon instanceof DivIcon ? icon : new DivIcon(icon)
  }

  marker = new Marker(toLatLng(coords), options).addTo(map)

  if (draggable) {
    listeners.dragend = () => {
      emit('change', marker.getLngLat())
    }
  }

  Object.keys(listeners).forEach((listener) => {
    marker.on(listener, listeners[listener])
  })
})

onBeforeUnmount(() => {
  Object.keys(listeners).forEach((listener) => {
    marker.off(listener, listeners[listener])
  })

  const map = getMap()
  if (map) {
    map.removeLayer(marker)
  }
  marker.remove()
})

watch(() => props.coords, (coords) => {
  marker.setLatLng(unref(toLatLng(coords)))
})

watch(() => props.icon, (icon) => {
  marker.setIcon(icon instanceof DivIcon ? icon : new DivIcon(icon))
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
