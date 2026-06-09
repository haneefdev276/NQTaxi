import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Star, MapPin, Navigation } from 'lucide-react'
import { activeRides } from '@data/mockData'

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const carIcon = L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#F5C518;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(245,197,24,0.6);border:2px solid #fff">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A0A"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const startIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#22C55E;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const endIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#EF4444;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function MapController({ selectedRide }) {
  const map = useMap()
  useEffect(() => {
    if (selectedRide?.route?.length) {
      map.fitBounds(selectedRide.route, { padding: [60, 60] })
    }
  }, [map, selectedRide])
  return null
}

function RideRoutes({ rides, selectedId }) {
  return rides.map((ride) => (
    <Polyline
      key={ride.id}
      positions={ride.route}
      color={ride.id === selectedId ? '#F5C518' : 'rgba(245,197,24,0.25)'}
      weight={ride.id === selectedId ? 5 : 2}
      opacity={ride.id === selectedId ? 1 : 0.5}
    />
  ))
}

function RideMarkers({ rides, selectedId }) {
  const selected = rides.find((r) => r.id === selectedId)
  if (!selected) return null

  return (
    <>
      <Marker position={selected.route[0]} icon={startIcon} />
      <Marker position={selected.route[selected.route.length - 1]} icon={endIcon} />
      <Marker position={selected.carPosition} icon={carIcon} />
      {rides
        .filter((r) => r.id !== selectedId)
        .map((ride) => (
          <Marker
            key={ride.id}
            position={ride.carPosition}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:12px;height:12px;border-radius:50%;background:rgba(245,197,24,0.6);border:2px solid rgba(255,255,255,0.5)"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          />
        ))}
    </>
  )
}

export default function ActiveMapTracking() {
  const [selectedId, setSelectedId] = useState(activeRides[0].id)
  const selected = activeRides.find((r) => r.id === selectedId)

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Ride list sidebar */}
      <div className="w-[320px] flex-shrink-0 bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold">Active Rides</h3>
          <p className="text-white/40 text-xs mt-0.5">{activeRides.length} ongoing rides</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeRides.map((ride) => (
            <button
              key={ride.id}
              onClick={() => setSelectedId(ride.id)}
              className={`w-full text-left px-5 py-4 border-b border-white/5 transition hover:bg-white/[0.03] ${
                ride.id === selectedId ? 'bg-brand-yellow/10 border-l-2 border-l-brand-yellow' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <img src={ride.driver.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{ride.driver.name}</p>
                  <p className="text-white/40 text-xs">{ride.user}</p>
                </div>
                <span className="badge-warning text-[10px]">{ride.status}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{ride.pickup}</span>
                <Navigation className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{ride.drop}</span>
              </div>
              <p className="text-white/30 text-[10px] mt-1 font-mono">{ride.id}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Live Map Tracking</h3>
            <p className="text-white/40 text-xs">Real-time fleet monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={[28.6139, 77.2090]}
            zoom={12}
            style={{ height: '100%', width: '100%', background: '#0E0F11' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer url={DARK_TILE} />
            <RideRoutes rides={activeRides} selectedId={selectedId} />
            <RideMarkers rides={activeRides} selectedId={selectedId} />
            <MapController selectedRide={selected} />
          </MapContainer>
        </div>

        {selected && (
          <div className="px-5 py-4 border-t border-white/5 flex items-center gap-4">
            <img src={selected.driver.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">{selected.driver.name}</p>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow" />
                  <span className="text-white/50 text-sm">{selected.driver.rating}</span>
                </div>
              </div>
              <p className="text-white/40 text-sm">
                {selected.pickup} → {selected.drop}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Vehicle</p>
              <p className="text-white text-sm font-mono">{selected.driver.plate}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Booking</p>
              <p className="text-brand-yellow text-sm font-mono">{selected.id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
