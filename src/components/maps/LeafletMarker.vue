<script>
  import { Marker, DivIcon } from 'leaflet'

  export default {
    name: 'LeafletMarker',
    inject: ['getMap'],
    model: {
      prop: 'coords',
      event: 'change'
    },
    props: {
      coords: {
        type: Object,
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
    },
    beforeMount() {
      const map = this.getMap()
      const {
        coords: { lat, lng },
        icon,
        draggable,
        ...options
      } = this.$props

      if (icon) {
        options.icon = icon instanceof DivIcon ? icon : new DivIcon(icon)
      }

      const marker = new Marker([lat, lng], options).addTo(map)

      const listeners = { ...this.$listeners }
      if (draggable) {
        listeners.dragend = () => {
          this.$emit('change', marker.getLngLat())
        }
      }

      Object.keys(listeners).forEach((listener) => {
        marker.on(listener, listeners[listener])
      })

      const unwatchCoords = this.$watch('coords', (coords) => {
        marker.setLatLng(coords)
      })

      this.$once('hook:beforeDestroy', () => {
        unwatchCoords()
        Object.keys(listeners).forEach((listener) => {
          marker.off(listener, listeners[listener])
        })

        if (map) {
          map.removeLayer(marker)
        }
        marker.remove()
      })
    },
    render() {
      return null
    }
  }
</script>

<style lang="scss">

</style>
