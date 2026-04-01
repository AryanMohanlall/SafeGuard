'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AimOutlined,
  ClearOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  SendOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Space,
  Statistic,
  Tag,
  theme,
  Typography,
} from 'antd';
import { useCaseAction, useCaseState } from '@/providers/cases-provider';
import type { ICase } from '@/providers/cases-provider/context';
import { useIncidentAction, useIncidentState } from '@/providers/incidents-provider';
import type { IIncident } from '@/providers/incidents-provider/context';
import type {
  AlertsMapProps,
  DispatchRoute,
  FocusTarget,
  Responder,
  ResponderStatus,
} from '@/components/safeguard/AlertsMap';
import { useStyles } from './styles/style';

const { Text, Title } = Typography;

const AlertsMap = dynamic(() => import('@/components/safeguard/AlertsMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Loading map...
    </div>
  ),
});

const ACTIVE_CASE_STATUSES = new Set(['Draft', 'Open', 'UnderReview', 'PendingTrial']);

const INITIAL_RESPONDERS: Responder[] = [
  {
    id: 'responder-1',
    rank: 'Sgt.',
    name: 'Themba Dlamini',
    sector: 'Sandton sector',
    status: 'Available',
    latitude: -26.1076,
    longitude: 28.0567,
    initials: 'TD',
    lastUpdatedMinutes: 4,
  },
  {
    id: 'responder-2',
    rank: 'Cst.',
    name: 'Priya Naidoo',
    sector: 'Rosebank sector',
    status: 'En Route',
    latitude: -26.1459,
    longitude: 28.0404,
    initials: 'PN',
    lastUpdatedMinutes: 7,
  },
  {
    id: 'responder-3',
    rank: 'Sgt.',
    name: 'Johan van der Berg',
    sector: 'Soweto sector',
    status: 'Available',
    latitude: -26.2678,
    longitude: 27.8585,
    initials: 'JV',
    lastUpdatedMinutes: 2,
  },
  {
    id: 'responder-4',
    rank: 'Cst.',
    name: 'Nomvula Khumalo',
    sector: 'Midrand sector',
    status: 'Available',
    latitude: -25.9992,
    longitude: 28.1263,
    initials: 'NK',
    lastUpdatedMinutes: 11,
  },
  {
    id: 'responder-5',
    rank: 'Lt.',
    name: 'Farouk Hendricks',
    sector: 'CBD sector',
    status: 'On Scene',
    latitude: -26.2041,
    longitude: 28.0473,
    initials: 'FH',
    lastUpdatedMinutes: 1,
  },
  {
    id: 'responder-6',
    rank: 'Cst.',
    name: 'Lerato Molefe',
    sector: 'Randburg sector',
    status: 'Available',
    latitude: -26.0934,
    longitude: 27.9946,
    initials: 'LM',
    lastUpdatedMinutes: 6,
  },
];

function derivePriority(incident: IIncident): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (incident.priorityTag) {
    return incident.priorityTag;
  }

  if (typeof incident.caseLikelihood === 'number') {
    if (incident.caseLikelihood >= 0.75) return 'HIGH';
    if (incident.caseLikelihood >= 0.4) return 'MEDIUM';
  }

  const haystack = `${incident.title} ${incident.description}`.toLowerCase();
  if (/(gun|shoot|armed|fire|explosion|attack|assault|hijack|critical)/.test(haystack)) return 'HIGH';
  if (/(fight|suspicious|theft|robbery|crowd|traffic|break)/.test(haystack)) return 'MEDIUM';
  return 'LOW';
}

function getResponderTagColor(status: ResponderStatus) {
  if (status === 'Available') return 'success';
  if (status === 'En Route') return 'warning';
  return 'error';
}

function getStatusLabel(route: DispatchRoute | undefined, responders: Responder[]): 'Unassigned' | 'Dispatched' | 'On Scene' {
  if (!route) return 'Unassigned';
  const responder = responders.find((item) => item.id === route.responderId);
  return responder?.status === 'On Scene' ? 'On Scene' : 'Dispatched';
}

function getStatusColor(status: 'Unassigned' | 'Dispatched' | 'On Scene') {
  if (status === 'Unassigned') return 'default';
  if (status === 'Dispatched') return 'processing';
  return 'error';
}

function timeAgo(value: string | null | undefined) {
  if (!value) return 'No recent activity';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function haversineKm(startLat: number, startLng: number, endLat: number, endLng: number) {
  const earthRadiusKm = 6371;
  const deltaLat = ((endLat - startLat) * Math.PI) / 180;
  const deltaLng = ((endLng - startLng) * Math.PI) / 180;
  const startLatRad = (startLat * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.sin(deltaLng / 2) ** 2 * Math.cos(startLatRad) * Math.cos(endLatRad);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildCaseLookup(cases: ICase[]) {
  return new Map(cases.map((item) => [item.id, item]));
}

export default function AlertsDispatchPage() {
  const { styles, cx } = useStyles();
  const router = useRouter();
  const { token } = theme.useToken();

  const { items: incidents, isPending: incidentsPending } = useIncidentState();
  const { fetchAll: fetchIncidents } = useIncidentAction();
  const { items: cases, isPending: casesPending } = useCaseState();
  const { fetchAll: fetchCases } = useCaseAction();

  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const [routes, setRoutes] = useState<DispatchRoute[]>([]);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const focusSequenceRef = useRef(0);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [showLoadsheddingZones, setShowLoadsheddingZones] = useState(false);
  const [showRoadblocks, setShowRoadblocks] = useState(false);

  useEffect(() => {
    fetchIncidents({ skipCount: 0, maxResultCount: 1000 });
    fetchCases({ skipCount: 0, maxResultCount: 100, sorting: 'lastActivityAt DESC' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const caseLookup = useMemo(() => buildCaseLookup(cases), [cases]);

  const queueIncidents = useMemo(() => {
    return [...incidents]
      .filter((incident) => {
        if (!incident.caseId) return true;
        const caseItem = caseLookup.get(incident.caseId);
        return caseItem ? ACTIVE_CASE_STATUSES.has(caseItem.status) : true;
      })
      .sort((left, right) => {
        const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const priorityDelta = priorityRank[derivePriority(left)] - priorityRank[derivePriority(right)];
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime();
      });
  }, [caseLookup, incidents]);

  const recentCases = useMemo(() => {
    return [...cases]
      .sort((left, right) => {
        const leftDate = left.lastActivityAt ?? left.creationTime;
        const rightDate = right.lastActivityAt ?? right.creationTime;
        return new Date(rightDate).getTime() - new Date(leftDate).getTime();
      })
      .slice(0, 5);
  }, [cases]);

  const availableCount = responders.filter((item) => item.status === 'Available').length;
  const enRouteCount = responders.filter((item) => item.status === 'En Route').length;
  const highPriorityUnassigned = queueIncidents.filter((incident) => {
    const isHigh = derivePriority(incident) === 'HIGH';
    const hasRoute = routes.some((route) => route.incidentId === incident.id);
    return isHigh && !hasRoute;
  }).length;

  const focusIncident = (incident: IIncident) => {
    if (incident.latitude == null || incident.longitude == null) return;

    focusSequenceRef.current += 1;
    setFocusTarget({
      id: incident.id,
      latitude: incident.latitude as number,
      longitude: incident.longitude as number,
      sequence: focusSequenceRef.current,
    });
  };

  const handleDispatch = (incidentId: string) => {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident || incident.latitude == null || incident.longitude == null) return;

    const currentRoute = routes.find((item) => item.incidentId === incidentId);
    if (currentRoute) {
      focusIncident(incident);
      return;
    }

    const availableResponders = responders.filter((item) => item.status === 'Available');
    if (availableResponders.length === 0) return;

    const nearestResponder = availableResponders.reduce((closest, candidate) => {
      const candidateDistance = haversineKm(
        candidate.latitude,
        candidate.longitude,
        incident.latitude as number,
        incident.longitude as number,
      );

      if (!closest) {
        return { responder: candidate, distance: candidateDistance };
      }

      return candidateDistance < closest.distance
        ? { responder: candidate, distance: candidateDistance }
        : closest;
    }, null as { responder: Responder; distance: number } | null);

    if (!nearestResponder) return;

    const route: DispatchRoute = {
      incidentId,
      responderId: nearestResponder.responder.id,
      responderLatitude: nearestResponder.responder.latitude,
      responderLongitude: nearestResponder.responder.longitude,
      incidentLatitude: incident.latitude,
      incidentLongitude: incident.longitude,
      distanceKm: Number(nearestResponder.distance.toFixed(1)),
    };

    setRoutes((current) => [...current, route]);
    setResponders((current) =>
      current.map((item) =>
        item.id === nearestResponder.responder.id
          ? { ...item, status: 'En Route', lastUpdatedMinutes: 0 }
          : item,
        ),
    );
    focusIncident(incident);
  };

  const handleViewOnMap = (incident: IIncident) => {
    focusIncident(incident);
  };

  const mapProps: AlertsMapProps = {
    incidents: queueIncidents,
    responders,
    routes,
    focusTarget,
    centerTrigger,
    showLoadsheddingZones,
    showRoadblocks,
    onDispatch: handleDispatch,
    onFocusHandled: () => setFocusTarget(null),
    priorityColors: {
      high: token.colorError,
      medium: token.colorWarning,
      low: token.colorTextQuaternary,
    },
    mapColors: {
      responderBlue: token.colorInfo,
      responderText: token.colorWhite,
      routeBlue: token.colorInfo,
      roadblock: token.colorWarning,
      roadsheddingFill: token.colorErrorBg,
      roadsheddingStroke: token.colorError,
      popupButton: token.colorPrimary,
      popupButtonText: token.colorWhite,
      popupMutedText: token.colorTextSecondary,
      popupSurface: token.colorBgElevated,
      popupBorder: token.colorBorderSecondary,
    },
  };

  return (
    <div className={styles.page}>
      <div className={cx(styles.panel, styles.leftPanel)}>
        <div className={styles.leftScroll}>
          <div className={styles.headerBlock}>
            <Title level={3} className={styles.pageTitle}>
              Alerts &amp; Dispatch
            </Title>
            <Text type="secondary">
              Live command view for active incidents, responder availability, and field constraints.
            </Text>
          </div>

          <div className={styles.statsGrid}>
            <Card size="small" className={styles.statCard}>
              <Statistic title="Active incidents" value={queueIncidents.length} loading={incidentsPending} />
            </Card>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="Responders available"
                value={availableCount}
                styles={{ content: { color: token.colorSuccess } }}
              />
            </Card>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="En route"
                value={enRouteCount}
                styles={{ content: { color: token.colorWarning } }}
              />
            </Card>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="High priority unassigned"
                value={highPriorityUnassigned}
                styles={{ content: { color: token.colorError } }}
              />
            </Card>
          </div>

          <Card
            title="Incident queue"
            extra={<Badge count={queueIncidents.length} color={token.colorPrimary} />}
            className={styles.sectionCard}
          >
            {queueIncidents.length === 0 ? (
              <Text type="secondary">No active incidents in the queue.</Text>
            ) : (
              <div>
                {queueIncidents.map((incident) => {
                  const route = routes.find((item) => item.incidentId === incident.id);
                  const priority = derivePriority(incident);
                  const statusLabel = getStatusLabel(route, responders);
                  const hasCoordinates = incident.latitude != null && incident.longitude != null;

                  return (
                    <div key={incident.id} className={styles.listItem}>
                      <Card size="small" className={styles.incidentCard}>
                        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                          <div className={styles.cardHeader}>
                            <div>
                              <Space size={[8, 8]} wrap>
                                <Tag color={priority === 'HIGH' ? 'error' : priority === 'MEDIUM' ? 'warning' : 'default'}>
                                  {priority}
                                </Tag>
                                <Tag color={getStatusColor(statusLabel)}>{statusLabel}</Tag>
                              </Space>
                              <div className={styles.cardTitle}>{incident.title}</div>
                            </div>
                          </div>

                          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                            <Text className={styles.metaRow}>
                              <EnvironmentOutlined /> {incident.location}
                            </Text>
                            <Text className={styles.metaRow}>Reported {timeAgo(incident.reportedAt)}</Text>
                            {route && (
                              <Text className={styles.routeText}>
                                Assigned responder is {route.distanceKm} km away by straight-line estimate.
                              </Text>
                            )}
                          </Space>

                          <Space wrap>
                            <Button
                              size="small"
                              icon={<AimOutlined />}
                              onClick={() => handleViewOnMap(incident)}
                              disabled={!hasCoordinates}
                            >
                              View on map
                            </Button>
                            <Button
                              size="small"
                              type="primary"
                              icon={<SendOutlined />}
                              onClick={() => handleDispatch(incident.id)}
                              disabled={!hasCoordinates || !!route}
                            >
                              {route ? 'Dispatched' : 'Dispatch'}
                            </Button>
                          </Space>
                        </Space>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Available responders" className={styles.sectionCard}>
            <div>
              {responders.map((responder) => (
                <div key={responder.id} className={styles.listItem}>
                  <Card size="small" className={styles.responderCard}>
                    <div className={styles.responderRow}>
                      <Avatar
                        className={cx(
                          styles.responderAvatar,
                          responder.status === 'Available' && styles.avatarAvailable,
                          responder.status === 'En Route' && styles.avatarEnRoute,
                          responder.status === 'On Scene' && styles.avatarOnScene,
                        )}
                      >
                        {responder.initials}
                      </Avatar>
                      <div className={styles.responderMetaBlock}>
                        <div className={styles.responderName}>
                          {responder.rank} {responder.name}
                        </div>
                        <Text type="secondary">{responder.sector}</Text>
                        <Text type="secondary">Updated {responder.lastUpdatedMinutes} min ago</Text>
                      </div>
                      <Tag color={getResponderTagColor(responder.status)}>{responder.status}</Tag>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </Card>

          <Collapse
            className={styles.collapse}
            defaultActiveKey={['case-activity']}
            items={[
              {
                key: 'case-activity',
                label: 'Case activity',
                children: casesPending ? (
                  <Text type="secondary">Loading case activity...</Text>
                ) : recentCases.length === 0 ? (
                  <Text type="secondary">No recent case activity.</Text>
                ) : (
                  <div>
                    {recentCases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className={styles.caseActivityRow}
                        onClick={() => router.push(`/cases/${caseItem.id}`)}
                      >
                        <div className={styles.caseActivityContent}>
                          <div>
                            <div className={styles.caseNumber}>{caseItem.caseNumber}</div>
                            <div className={styles.caseTitle}>{caseItem.title}</div>
                          </div>
                          <Space wrap size={[8, 8]} className={styles.caseActivityMeta}>
                            <Tag color={caseItem.status === 'Closed' ? 'default' : 'processing'}>{caseItem.status}</Tag>
                            <Text type="secondary">{timeAgo(caseItem.lastActivityAt ?? caseItem.creationTime)}</Text>
                          </Space>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className={cx(styles.panel, styles.rightPanel)}>
        <div className={styles.mapSurface}>
          <AlertsMap {...mapProps} />

          <Card size="small" className={styles.mapControls}>
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
              <Text strong>Map controls</Text>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={() => setShowLoadsheddingZones((value) => !value)}
                type={showLoadsheddingZones ? 'primary' : 'default'}
              >
                Loadshedding zones
              </Button>
              <Button
                icon={<WarningOutlined />}
                onClick={() => setShowRoadblocks((value) => !value)}
                type={showRoadblocks ? 'primary' : 'default'}
              >
                Roadblocks
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  setRoutes([]);
                  setResponders(INITIAL_RESPONDERS);
                }}
                disabled={routes.length === 0}
              >
                Clear routes
              </Button>
              <Button icon={<CompassOutlined />} onClick={() => setCenterTrigger((value) => value + 1)}>
                Center map
              </Button>
            </Space>
          </Card>

          {showLoadsheddingZones && (
            <Card size="small" className={styles.legend}>
              <Space align="center">
                <span
                  className={styles.legendSwatch}
                  style={{
                    background: token.colorErrorBg,
                    borderColor: token.colorError,
                  }}
                />
                <Text>Stage 2 loadshedding active</Text>
              </Space>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
