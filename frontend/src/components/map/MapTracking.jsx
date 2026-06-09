import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Star } from 'lucide-react'

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

function createIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const startIcon = createIcon('#22C55E', 12)
const endIcon = createIcon('#EF4444', 12)

const carIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#F5C518;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(245,197,24,0.5);border:2px solid #fff">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0A0A"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function FitBounds({ route }) {
  const map = useMap()
  useEffect(() => {
    if (route?.length) {
      map.fitBounds(route, { padding: [30, 30] })
    }
  }, [map, route])
  return null
}

export default function MapTracking({
  route,
  carPosition,
  driver,
  pickup,
  drop,
  status = 'Ongoing Ride',
  height = '280px',
  showFooter = true,
}) {
  const start = route[0]
  const end = route[route.length - 1]

  return (
    <div className="bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-white font-semibold">Live Tracking</h3>
        {status && <span className="badge-warning">{status}</span>}
      </div>

      <div style={{ height }} className="relative">
        <MapContainer
          center={carPosition || start}
          zoom={14}
          style={{ height: '100%', width: '100%', background: '#0E0F11' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={DARK_TILE} />
          <Polyline positions={route} color="#F5C518" weight={4} opacity={0.9} />
          <Marker position={start} icon={startIcon} />
          <Marker position={end} icon={endIcon} />
          {carPosition && <Marker position={carPosition} icon={carIcon} />}
          <FitBounds route={route} />
        </MapContainer>
      </div>

      {showFooter && driver && (
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-3">
          <img src={driver.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium">{driver.name}</p>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-brand-yellow fill-brand-yellow" />
                <span className="text-white/50 text-xs">{driver.rating}</span>
              </div>
            </div>
            <p className="text-white/40 text-xs truncate">
              {pickup} → {drop}
            </p>
          </div>
          {driver.plate && (
            <span className="text-white/50 text-xs bg-white/5 px-2 py-1 rounded-md font-mono">
              {driver.plate}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
