'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { IIncident } from '@/providers/incidents-provider/context';

interface HeatLayerProps {
  points: [number, number, number][];
}

function HeatLayer({ points }: HeatLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    let cancelled = false;
    let addedLayer: L.Layer | null = null;

    import('leaflet.heat').then(() => {
      if (cancelled) return;

      const layer = (L as unknown as { heatLayer: (pts: [number, number, number][], opts: object) => L.Layer }).heatLayer(points, {
        radius: 40,
        blur: 45,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.3,
        gradient: { 0.0: '#fde68a', 0.3: '#f97316', 0.6: '#dc2626', 1.0: '#7f1d1d' },
      });

      layer.addTo(map);
      addedLayer = layer;

      const allLatLng = points.map(([lat, lng]) => L.latLng(lat, lng));
      if (allLatLng.length === 1) {
        map.setView(allLatLng[0], 13);
      } else {
        map.fitBounds(L.latLngBounds(allLatLng), { padding: [40, 40] });
      }
    });

    return () => {
      cancelled = true;
      if (addedLayer) map.removeLayer(addedLayer);
    };
  }, [map, points]);

  return null;
}

interface Props {
  incidents: IIncident[];
}

export default function IncidentHeatmap({ incidents }: Props) {
  const points: [number, number, number][] = incidents
    .filter((i) => i.latitude != null && i.longitude != null)
    .map((i) => [i.latitude as number, i.longitude as number, 1]);

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%', borderRadius: 8 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.length > 0 && <HeatLayer points={points} />}
    </MapContainer>
  );
}
