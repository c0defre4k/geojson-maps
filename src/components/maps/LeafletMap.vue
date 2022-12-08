<template>
  <div class="map">
    <slot v-if="hasLoaded" />
  </div>
</template>

<script>
  import { onBeforeUnmount } from 'vue'
  import {
    Map,
    Icon,
    TileLayer,
    LatLng,
    LatLngBounds
  } from 'leaflet'
  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
  import iconUrl from 'leaflet/dist/images/marker-icon.png'
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
  import { makeBasemapTileLayer } from './util'

  // fix leaflet icons
  // eslint-disable-next-line no-underscore-dangle
  delete Icon.Default.prototype._getIconUrl

  Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
  })

  export default {
    name: 'LeafletMap',
    provide() {
      return {
        getMap: () => this.$options.map
      }
    },
    props: {
      layers: {
        type: Array,
        default() {
          const [url, options] = makeBasemapTileLayer()
          return [new TileLayer(url, options)]
        }
      },
      center: {
        type: [Object, LatLng],
        default: () => ({ lat: 20, lng: 0 })
      },
      zoom: {
        type: Number,
        default: 2
      },
      attributionControl: {
        type: Boolean,
        default: true
      },
      zoomControl: {
        type: Boolean,
        default: true
      },
      maxZoom: {
        type: Number,
        default: undefined
      },
      scrollWheelZoom: {
        type: Boolean,
        default: true
      },
      fitBounds: {
        type: [Array, LatLngBounds],
        default: undefined
      },
      fitOptions: {
        type: Object,
        default: undefined
      }
    },
    data() {
      return {
        hasLoaded: false
      }
    },
    watch: {
      layers(layers, oldLayers) {
        const { map } = this.$options
        if (!map) {
          return
        }

        const removed = oldLayers.filter(layer => layers.indexOf(layer) < 0)

        removed.forEach(layer => map.removeLayer(layer))
        layers.forEach((layer) => {
          if (oldLayers.indexOf(layer) < 0) {
            map.addLayer(layer)
          }
        })
      },
      center(center, oldCenter) {
        if (center.lat !== oldCenter.lat || center.lng !== oldCenter.lng) {
          this.$options.map.setZoom(this.zoom)
          this.$options.map.panTo(center)
        }
      },
      zoom(zoom, oldZoom) {
        if (zoom !== oldZoom) {
          this.$options.map.setZoom(zoom)
        }
      },
      fitBounds: 'updateBounds',
      fitOptions: 'updateBounds'
    },
    mounted() {
      const map = new Map(this.$el, {
        ...this.$props
      })

      this.$options.map = map
      const resolveMap = () => {
        if (this.fitBounds) {
          this.updateBounds(this.fitBounds)
        }

        this.hasLoaded = true
      }
      map.whenReady(resolveMap)

      this.$bindPropsUpdateEvents(map)

      onBeforeUnmount(() => {
        map.remove()
        this.$options.map = null
      })
    },
    methods: {
      $bindPropsUpdateEvents(map) {
        const [zoom, center] = [
          map.getZoom(),
          map.getCenter()
        ]
        this.$emit('update:zoom', zoom)
        this.$emit('update:center', center)
        map.on('moveend', () => {
          this.$emit('update:center', map.getCenter())
        })
        map.on('zoomend', () => {
          this.$emit('update:zoom', map.getZoom())
        })
      },
      updateBounds(bounds, oldBounds) {
        const latLngBounds = bounds instanceof LatLngBounds ? bounds : new LatLngBounds(bounds)
        const oldLatLngBounds = oldBounds instanceof LatLngBounds ? oldBounds : new LatLngBounds(oldBounds)

        if (
          latLngBounds
          && (oldLatLngBounds && !latLngBounds.equals(oldLatLngBounds))
        ) {
          this.$options.map.fitBounds(latLngBounds, this.fitOptions)
        }
      },
      update() {
        this.$options.map.invalidateSize(false);
      }
    },
    expose: ['update']
  }
</script>

<style lang="scss">
  @import 'leaflet/dist/leaflet.css';
</style>
