export function queryString(params) {
  const esc = encodeURIComponent
  return Object.keys(params)
    .map((key) => `${esc(key)}=${esc(params[key])}`)
    .join('&')
}

export function makeBasemapTileLayer({
  maxZoom = 19,
  type = 'normal',
  format = 'jpeg',
  variant = 'bmaphidpi'
} = {}) {
  const options = {
    maxZoom: Math.min(19, maxZoom),
    attribution: 'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
    subdomains: ['', '1', '2', '3', '4'],
    type,
    format,
    bounds: [
      [46.35877, 8.782379],
      [49.037872, 17.189532]
    ],
    variant
  }
  const url = `https://maps{s}.wien.gv.at/basemap/{variant}/{type}/google3857/{z}/{y}/{x}.{format}`

  return [url, options]
}
