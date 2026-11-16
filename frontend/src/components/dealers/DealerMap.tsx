import { divIcon, latLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Dealer } from '../../api/types'

const PERU_CENTER: [number, number] = [-9.19, -75.02]

const pin = divIcon({
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
  html: `<svg viewBox="0 0 32 40" width="32" height="40" aria-hidden="true"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0Z" fill="#2b2b2b"/><text x="16" y="21" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-style="italic" font-size="14" fill="#f37a1f">CM</text></svg>`,
})

function FitBounds({ dealers }: { dealers: Dealer[] }) {
  const map = useMap()
  useEffect(() => {
    const points = dealers.filter((d) => d.lat !== null && d.lng !== null).map((d) => [d.lat!, d.lng!] as [number, number])
    if (points.length === 0) return
    if (points.length === 1) map.setView(points[0], 13)
    else map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 13 })
  }, [dealers, map])
  return null
}

export function DealerMap({ dealers }: { dealers: Dealer[] }) {
  return (
    <MapContainer center={PERU_CENTER} zoom={5} scrollWheelZoom={false} className="h-[560px] w-full bg-[#e3e2df]">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds dealers={dealers} />
      {dealers
        .filter((d) => d.lat !== null && d.lng !== null)
        .map((dealer) => (
          <Marker key={dealer.id} position={[dealer.lat!, dealer.lng!]} icon={pin}>
            <Popup>
              <strong>{dealer.name}</strong>
              <br />
              {dealer.address}, {dealer.city}
              <br />
              <a href={`tel:${dealer.phone.replace(/\s/g, '')}`}>{dealer.phone}</a>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
