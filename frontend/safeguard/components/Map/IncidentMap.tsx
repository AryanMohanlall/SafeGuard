'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { IIncident } from '@/providers/incidents-provider/context';
import dayjs from 'dayjs';

// Fix Leaflet's broken default icon paths in webpack / Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
  }, [map, positions]);
  return null;
}

interface Props {
  incidents: IIncident[];
  onSelect: (incident: IIncident) => void;
  loading?: boolean;
}

export default function IncidentMap({ incidents, onSelect, loading }: Props) {
  const mapped = useMemo(
    () => incidents.filter((i) => i.latitude != null && i.longitude != null),
    [incidents],
  );

  const positions = useMemo<[number, number][]>(
    () => mapped.map((i) => [i.latitude as number, i.longitude as number]),
    [mapped],
  );

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Loading map…
      </div>
    );
  }

  return (
    <MapContainer
      center={positions[0] ?? [0, 0]}
      zoom={positions.length > 0 ? 13 : 2}
      style={{ height: '100%', width: '100%', borderRadius: 8 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds positions={positions} />

      {mapped.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude as number, incident.longitude as number]}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong style={{ fontSize: 13 }}>{incident.title}</strong>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {incident.location}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {dayjs(incident.occurredAt).format('DD MMM YYYY HH:mm')}
              </div>
              <button
                onClick={() => onSelect(incident)}
                style={{
                  marginTop: 8,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                View details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
