'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Button, Space, Tag, Typography } from 'antd';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import type { IIncident } from '@/providers/incidents-provider/context';

const { Text } = Typography;

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const JOHANNESBURG_CENTER: [number, number] = [-26.2041, 28.0473];
const DEFAULT_ZOOM = 11;

const LOADSHEDDING_ZONES: [number, number][][] = [
  [
    [-26.126, 27.955],
    [-26.104, 27.993],
    [-26.143, 28.021],
    [-26.169, 27.972],
  ],
  [
    [-26.032, 28.071],
    [-26.014, 28.134],
    [-26.061, 28.162],
    [-26.087, 28.098],
  ],
  [
    [-33.934, 18.427],
    [-33.915, 18.471],
    [-33.952, 18.496],
    [-33.977, 18.446],
  ],
  [
    [-33.888, 18.511],
    [-33.872, 18.56],
    [-33.914, 18.583],
    [-33.933, 18.53],
  ],
];

const ROADBLOCKS: RoadblockMarker[] = [
  { id: 'roadblock-1', label: 'Police roadblock - N1 Northbound', latitude: -25.9843, longitude: 28.1154, source: 'fallback' },
  { id: 'roadblock-2', label: 'Police roadblock - M1 South off-ramp', latitude: -26.1784, longitude: 28.0471, source: 'fallback' },
  { id: 'roadblock-3', label: 'Police roadblock - N3 Heidelberg corridor', latitude: -26.2467, longitude: 28.1297, source: 'fallback' },
  { id: 'roadblock-4', label: 'Police roadblock - N2 Airport approach', latitude: -29.9658, longitude: 30.9482, source: 'fallback' },
];

export type ResponderStatus = 'Available' | 'En Route' | 'On Scene';

export interface Responder {
  id: string;
  rank: string;
  name: string;
  sector: string;
  status: ResponderStatus;
  latitude: number;
  longitude: number;
  initials: string;
  lastUpdatedMinutes: number;
}

export interface DispatchRoute {
  incidentId: string;
  responderId: string;
  responderLatitude: number;
  responderLongitude: number;
  incidentLatitude: number;
  incidentLongitude: number;
  distanceKm: number;
}

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface RoadblockMarker {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  source: 'overpass' | 'fallback';
}

export interface FocusTarget {
  id: string;
  latitude: number;
  longitude: number;
  sequence: number;
}

export interface AlertsMapProps {
  incidents: IIncident[];
  responders: Responder[];
  routes: DispatchRoute[];
  focusTarget: FocusTarget | null;
  centerTrigger: number;
  showLoadsheddingZones: boolean;
  showRoadblocks: boolean;
  roadblocks: RoadblockMarker[];
  onDispatch: (incidentId: string) => void;
  onFocusHandled: () => void;
  onBoundsChange: (bounds: MapBounds) => void;
  priorityColors: {
    high: string;
    medium: string;
    low: string;
  };
  mapColors: {
    responderBlue: string;
    responderText: string;
    routeBlue: string;
    roadblock: string;
    roadsheddingFill: string;
    roadsheddingStroke: string;
    popupButton: string;
    popupButtonText: string;
    popupMutedText: string;
    popupSurface: string;
    popupBorder: string;
  };
}

function derivePriority(incident: IIncident): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (incident.priorityTag) return incident.priorityTag;
  if (typeof incident.caseLikelihood === 'number') {
    if (incident.caseLikelihood >= 0.75) return 'HIGH';
    if (incident.caseLikelihood >= 0.4) return 'MEDIUM';
  }

  const haystack = `${incident.title} ${incident.description}`.toLowerCase();
  if (/(gun|shoot|armed|fire|explosion|attack|assault|hijack|critical)/.test(haystack)) return 'HIGH';
  if (/(fight|suspicious|theft|robbery|crowd|traffic|break)/.test(haystack)) return 'MEDIUM';
  return 'LOW';
}

function getResponderOutline(status: ResponderStatus) {
  if (status === 'Available') return '#52c41a';
  if (status === 'En Route') return '#faad14';
  return '#ff4d4f';
}

function createResponderIcon(responder: Responder, colors: AlertsMapProps['mapColors']) {
  return L.divIcon({
    className: 'safeguard-responder-icon-wrapper',
    html: `
      <div
        style="
          width:36px;
          height:36px;
          border-radius:18px;
          background:${colors.responderBlue};
          color:${colors.responderText};
          border:3px solid ${getResponderOutline(responder.status)};
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:11px;
          font-weight:700;
          box-shadow:0 10px 24px rgba(0,0,0,0.16);
        "
      >
        ${responder.initials}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -16],
  });
}

function createRoadblockIcon(color: string) {
  return L.divIcon({
    className: 'safeguard-roadblock-icon-wrapper',
    html: `
      <div
        style="
          width:26px;
          height:26px;
          clip-path:polygon(50% 0%, 0% 100%, 100% 100%);
          background:${color};
          color:white;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          padding-bottom:4px;
          font-size:13px;
          font-weight:800;
          box-shadow:0 8px 20px rgba(0,0,0,0.16);
        "
      >
        !
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 23],
    popupAnchor: [0, -22],
  });
}

function FocusController({
  focusTarget,
  centerTrigger,
  onFocusHandled,
  markerRefs,
  onBoundsChange,
}: {
  focusTarget: FocusTarget | null;
  centerTrigger: number;
  onFocusHandled: () => void;
  markerRefs: MutableRefObject<Record<string, L.CircleMarker>>;
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusTarget) return;

    map.flyTo([focusTarget.latitude, focusTarget.longitude], 14, { duration: 0.8 });

    const timeoutId = window.setTimeout(() => {
      markerRefs.current[focusTarget.id]?.openPopup();
      onFocusHandled();
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [focusTarget, map, markerRefs, onFocusHandled]);

  useEffect(() => {
    if (centerTrigger === 0) return;
    map.flyTo(JOHANNESBURG_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }, [centerTrigger, map]);

  useEffect(() => {
    const emitBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    };

    emitBounds();
    map.on('moveend', emitBounds);
    map.on('zoomend', emitBounds);

    return () => {
      map.off('moveend', emitBounds);
      map.off('zoomend', emitBounds);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function AlertsMap({
  incidents,
  responders,
  routes,
  focusTarget,
  centerTrigger,
  showLoadsheddingZones,
  showRoadblocks,
  roadblocks,
  onDispatch,
  onFocusHandled,
  onBoundsChange,
  priorityColors,
  mapColors,
}: AlertsMapProps) {
  const markerRefs = useRef<Record<string, L.CircleMarker>>({});

  const positionedIncidents = useMemo(
    () => incidents.filter((item) => item.latitude != null && item.longitude != null),
    [incidents],
  );

  useEffect(() => {
    const styleId = 'safeguard-alerts-map-pulse';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .safeguard-pulsing-circle {
        animation: safeguardPulse 1.6s ease-in-out infinite;
        transform-origin: center;
      }

      @keyframes safeguardPulse {
        0% { stroke-opacity: 0.95; fill-opacity: 0.85; }
        50% { stroke-opacity: 0.4; fill-opacity: 0.35; }
        100% { stroke-opacity: 0.95; fill-opacity: 0.85; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <MapContainer
      center={JOHANNESBURG_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FocusController
        focusTarget={focusTarget}
        centerTrigger={centerTrigger}
        onFocusHandled={onFocusHandled}
        markerRefs={markerRefs}
        onBoundsChange={onBoundsChange}
      />

      {showLoadsheddingZones &&
        LOADSHEDDING_ZONES.map((coordinates, index) => (
          <Polygon
            key={`loadshedding-${index}`}
            positions={coordinates}
            pathOptions={{
              color: mapColors.roadsheddingStroke,
              fillColor: mapColors.roadsheddingFill,
              fillOpacity: 0.35,
              weight: 2,
            }}
          />
        ))}

      {positionedIncidents.map((incident) => {
        const priority = derivePriority(incident);
        const route = routes.find((item) => item.incidentId === incident.id);
        const color =
          priority === 'HIGH'
            ? priorityColors.high
            : priority === 'MEDIUM'
            ? priorityColors.medium
            : priorityColors.low;

        return (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude as number, incident.longitude as number]}
            radius={priority === 'HIGH' ? 12 : priority === 'MEDIUM' ? 10 : 8}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.9,
              weight: priority === 'HIGH' ? 4 : 3,
              className: priority === 'HIGH' ? 'safeguard-pulsing-circle' : undefined,
            }}
            ref={(instance) => {
              if (instance) markerRefs.current[incident.id] = instance;
            }}
          >
            <Popup>
              <Space orientation="vertical" size={8}>
                <div>
                  <div style={{ fontWeight: 700 }}>{incident.title}</div>
                  <Text style={{ color: mapColors.popupMutedText }}>{incident.location}</Text>
                </div>
                <Text style={{ color: mapColors.popupMutedText }}>
                  Occurred {new Date(incident.occurredAt).toLocaleString()}
                </Text>
                <Tag color={priority === 'HIGH' ? 'error' : priority === 'MEDIUM' ? 'warning' : 'default'}>
                  {priority}
                </Tag>
                {route && (
                  <Text style={{ color: mapColors.popupMutedText }}>
                    Nearest responder is {route.distanceKm} km away.
                  </Text>
                )}
                <Button type="primary" block onClick={() => onDispatch(incident.id)}>
                  Dispatch
                </Button>
              </Space>
            </Popup>
          </CircleMarker>
        );
      })}

      {responders.map((responder) => (
        <Marker
          key={responder.id}
          position={[responder.latitude, responder.longitude]}
          icon={createResponderIcon(responder, mapColors)}
        >
          <Popup>
            <Space orientation="vertical" size={6}>
              <div style={{ fontWeight: 700 }}>
                {responder.rank} {responder.name}
              </div>
              <Text style={{ color: mapColors.popupMutedText }}>{responder.sector}</Text>
              <Tag color={responder.status === 'Available' ? 'success' : responder.status === 'En Route' ? 'warning' : 'error'}>
                {responder.status}
              </Tag>
              <Text style={{ color: mapColors.popupMutedText }}>
                Updated {responder.lastUpdatedMinutes} min ago
              </Text>
            </Space>
          </Popup>
        </Marker>
      ))}

      {routes.map((route) => (
        <Polyline
          key={`${route.incidentId}-${route.responderId}`}
          positions={[
            [route.responderLatitude, route.responderLongitude],
            [route.incidentLatitude, route.incidentLongitude],
          ]}
          pathOptions={{
            color: mapColors.routeBlue,
            weight: 3,
            dashArray: '10 10',
            opacity: 0.9,
          }}
        />
      ))}

      {showRoadblocks &&
        (roadblocks.length > 0 ? roadblocks : ROADBLOCKS).map((roadblock) => (
          <Marker
            key={roadblock.id}
            position={[roadblock.latitude, roadblock.longitude]}
            icon={createRoadblockIcon(mapColors.roadblock)}
          >
            <Popup>
              <Space orientation="vertical" size={4}>
                <div style={{ fontWeight: 700 }}>{roadblock.label}</div>
                <Text style={{ color: mapColors.popupMutedText }}>
                  {roadblock.source === 'overpass' ? 'Live OSM / Overpass data' : 'Fallback operational marker'}
                </Text>
              </Space>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
