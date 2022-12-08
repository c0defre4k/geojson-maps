<script setup>
import { computed, ref, unref } from 'vue'
import * as pageSizes from '@/constants/pageSizes'

const props = defineProps({
  zoom: {
    type: Number,
    default: 0
  },
  center: {
    type: Object,
    default: () => ({ lat: 0, lng: 0 })
  },
  layerStyle: {
    type: Object,
    default: Object
  },
  geoJsonLabel: {
    type: String,
    default: undefined
  },
  pageSize: {
    type: String,
    default: () => 'A4'
  },
  pageMargin: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:geoJson',
  'update:geoJsonLabel',
  'update:layerStyle',
  'update:zoom',
  'update:center',
  'update:pageSize',
  'update:pageMargin'
])

const lat = computed({
  get() {
    return props.center.lat
  },
  set(value) {
    emit('update:center', { lat: value, lng: unref(lng) })
  }
})

const lng = computed({
  get() {
    return props.center.lng
  },
  set(value) {
    emit('update:center', { lat: unref(lat), lng: value })
  }
})

let geoJson = ref(null)
const labels = computed(() => {
  if (!geoJson.value) {
    return []
  }

  const [{ properties }] = geoJson.value.features
  return Object.keys(properties)
})

function updateStyle(prop, value) {
  emit('update:layerStyle', {
    ...props.layerStyle,
    [prop]: value
  })
}

function readGeoJson(e) {
  const [file] = e.target.files
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    geoJson.value = JSON.parse(reader.result)
    geoJson.value.features = geoJson.value.features.filter((feature) => feature.properties.IncludeStatistics !== false)
    emit('update:geoJson', unref(geoJson))
  })
  reader.readAsText(file)
}
</script>

<template>
  <fieldset class="mb-4">
    <h2 class="text-2xl mb-3">
      GeoJSON
    </h2>
    <div class="mb-3">
      <label for="geojson">Geojson</label>
      <input
        id="geojson"
        type="file"
        name="geojson"
        accept="application/geo+json,application/json"
        @change="readGeoJson"
      >
    </div>
    <div class="mb-3">
      <label for="geoJsonLabel">Label field</label>
      <select
        id="geoJsonLabel"
        name="geoJsonLabel"
        :value="geoJsonLabel"
        @input="$emit('update:geoJsonLabel', $event.target.value)"
      >
        <option value="">
          None
        </option>
        <option
          v-for="label in labels"
          :key="label"
          :value="label"
        >
          {{ label }}
        </option>
      </select>
    </div>

    <h3 class="text-xl mb-3">
      Layer style
    </h3>
    <div class="mb-3">
      <label for="strokeWidth">Stroke width</label>
      <input
        id="strokeWidth"
        :value="layerStyle.weight"
        type="number"
        name="strokeWidth"
        step="1"
        @input="updateStyle('weight', Number($event.target.value))"
      >
    </div>
    <div class="mb-3">
      <label for="strokeColor">Stroke color</label>
      <div class="flex">
        <input
          id="strokeColor-hex"
          :value="layerStyle.color"
          type="text"
          name="strokeColor-hex"
          class="border-r-0 rounded-r-none"
          pattern="#[0-9]{6}"
          maxlength="7"
          @input="updateStyle('color', $event.target.value)"
        >
        <input
          id="strokeColor"
          :value="layerStyle.color"
          type="color"
          name="strokeColor"
          @input="updateStyle('color', $event.target.value)"
        >
      </div>
    </div>
    <div class="mb-3">
      <label for="strokeOpacity">Stroke opacity</label>
      <input
        id="strokeOpacity"
        :value="layerStyle.opacity"
        type="range"
        name="strokeOpacity"
        step="0.01"
        min="0"
        max="1"
        @input="updateStyle('opacity', Number($event.target.value))"
      >
      <small class="text-gray-700 dark:text-gray-400">{{ layerStyle.opacity }}</small>
    </div>
    <hr class="my-4">
    <div class="mb-3">
      <label for="fillColor">Fill color</label>
      <div class="flex">
        <input
          id="fillColor-hex"
          :value="layerStyle.fillColor || layerStyle.color"
          type="text"
          name="fillColor-hex"
          class="border-r-0 rounded-r-none"
          pattern="#[0-9]{6}"
          maxlength="7"
          @input="updateStyle('fillColor', $event.target.value)"
        >
        <input
          id="fillColor"
          :value="layerStyle.fillColor || layerStyle.color"
          type="color"
          name="fillColor"
          @input="updateStyle('fillColor', $event.target.value)"
        >
      </div>
    </div>
    <div class="mb-3">
      <label for="fillOpacity">Fill opacity</label>
      <input
        id="fillOpacity"
        :value="layerStyle.fillOpacity"
        type="range"
        name="fillOpacity"
        step="0.01"
        min="0"
        max="1"
        @input="updateStyle('fillOpacity', Number($event.target.value))"
      >
      <small class="text-gray-700 dark:text-gray-400">{{ layerStyle.fillOpacity }}</small>
    </div>
  </fieldset>

  <fieldset class="mb-4">
    <h2 class="text-2xl mb-3">
      Map
    </h2>
    <div class="mb-3">
      <label for="zoom">Zoom</label>
      <input
        id="zoom"
        :value="zoom"
        type="number"
        name="zoom"
        step="1"
        min="0"
        max="20"
        @input="$emit('update:zoom', Number($event.target.value))"
      >
    </div>

    <h4 class="text-lg">
      Center
    </h4>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label for="lat">Lat</label>
        <input
          id="lat"
          v-model.number.lazy="lat"
          type="number"
          step="0.1"
          name="lat"
        >
      </div>
      <div>
        <label for="lng">Lng</label>
        <input
          id="lng"
          v-model.number.lazy="lng"
          type="number"
          step="0.1"
          name="lng"
        >
      </div>
    </div>
  </fieldset>

  <fieldset>
    <h2 class="text-2xl mb 4">Page</h2>

    <div class="mb-3">
      <label for="pageSize">Size</label>
      <select
        id="pageSize"
        name="pageSize"
        :value="pageSize"
        @input="$emit('update:pageSize', $event.target.value)"
      >
        <option
          v-for="size in Object.keys(pageSizes)"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label for="pageMargin">Margin [cm]</label>
      <input
        id="pageMargin"
        :value="pageMargin"
        type="number"
        name="pageMargin"
        step="0.1"
        min="0"
        max="3"
        @input="$emit('update:pageMargin', Number($event.target.value))"
      >
    </div>
  </fieldset>
</template>

<style lang="scss">

</style>
