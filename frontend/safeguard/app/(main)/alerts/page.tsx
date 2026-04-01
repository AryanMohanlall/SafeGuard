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
  WarningOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  message,
  Space,
  Statistic,
  Tag,
  theme,
  Typography,
} from 'antd';
import { useCaseAction, useCaseState } from '@/providers/cases-provider';
import { useDispatchAction, useDispatchState } from '@/providers/dispatch-provider';
import type { IDispatch } from '@/providers/dispatch-provider/context';
import type { ICase } from '@/providers/cases-provider/context';
import { useIncidentAction, useIncidentState } from '@/providers/incidents-provider';
import type { IIncident } from '@/providers/incidents-provider/context';
import type {
  AlertsMapProps,
  DispatchRoute,
  FocusTarget,
  MapBounds,
  RoadblockMarker,
  Responder,
  ResponderStatus,
} from '@/components/safeguard/AlertsMap';
import { getAxiosInstance } from '@/utils/axiosInstance';
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
const ACTIVE_DISPATCH_STATUSES = new Set(['Dispatched', 'EnRoute', 'OnScene']);
const OFFICIAL_ROLE_PATTERN = /OFFICIAL|OFFICAL/i;
const CITIZEN_ROLE_PATTERN = /CITIZEN/i;

interface AlertUser {
  id: number;
  fullName?: string;
  name: string;
  surname: string;
  isActive: boolean;
  roleNames?: string[];
}

type OperationalResponder = Omit<Responder, 'latitude' | 'longitude'> & {
  officialUserId: number;
  latitude?: number | null;
  longitude?: number | null;
};

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

function getStatusLabel(dispatch: IDispatch | undefined): 'Unassigned' | 'Dispatched' | 'On Scene' {
  if (!dispatch) return 'Unassigned';
  return dispatch.status === 'OnScene' ? 'On Scene' : 'Dispatched';
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

const DEFAULT_MAP_BOUNDS: MapBounds = {
  south: -26.35,
  west: 27.85,
  north: -25.95,
  east: 28.25,
};

export default function AlertsDispatchPage() {
  const { styles, cx } = useStyles();
  const router = useRouter();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const axiosInstance = getAxiosInstance();

  const { items: incidents, isPending: incidentsPending } = useIncidentState();
  const { fetchAll: fetchIncidents } = useIncidentAction();
  const { items: cases, isPending: casesPending } = useCaseState();
  const { fetchAll: fetchCases } = useCaseAction();
  const { items: dispatches, isPending: dispatchesPending } = useDispatchState();
  const { create: createDispatch, fetchAll: fetchDispatches, transitionStatus } = useDispatchAction();
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const focusSequenceRef = useRef(0);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [showRoadblocks, setShowRoadblocks] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds>(DEFAULT_MAP_BOUNDS);
  const [roadblocks, setRoadblocks] = useState<RoadblockMarker[]>([]);
  const [users, setUsers] = useState<AlertUser[]>([]);

  useEffect(() => {
    fetchIncidents({ skipCount: 0, maxResultCount: 1000 });
    fetchCases({ skipCount: 0, maxResultCount: 100, sorting: 'lastActivityAt DESC' });
    fetchDispatches({ skipCount: 0, maxResultCount: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showRoadblocks) {
      setRoadblocks([]);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await axiosInstance.get('/api/services/app/roadblock/GetLive', {
          params: {
            south: mapBounds.south,
            west: mapBounds.west,
            north: mapBounds.north,
            east: mapBounds.east,
          },
        });

        if (!cancelled) {
          setRoadblocks(res.data.result?.items ?? []);
        }
      } catch {
        if (!cancelled) {
          setRoadblocks([]);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [axiosInstance, mapBounds, showRoadblocks]);

  useEffect(() => {
    let cancelled = false;

    void axiosInstance
      .get('/api/services/app/User/GetAll', {
        params: {
          skipCount: 0,
          maxResultCount: 1000,
        },
      })
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data.result?.items ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [axiosInstance]);

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

  const activeDispatches = useMemo(() => {
    const latestByIncident = new Map<string, IDispatch>();

    [...dispatches]
      .filter((dispatch) => ACTIVE_DISPATCH_STATUSES.has(dispatch.status))
      .sort((left, right) => new Date(right.assignedAt).getTime() - new Date(left.assignedAt).getTime())
      .forEach((dispatch) => {
        if (!latestByIncident.has(dispatch.incidentId)) {
          latestByIncident.set(dispatch.incidentId, dispatch);
        }
      });

    return [...latestByIncident.values()];
  }, [dispatches]);

  const dispatchByIncidentId = useMemo(
    () => new Map(activeDispatches.map((dispatch) => [dispatch.incidentId, dispatch])),
    [activeDispatches],
  );

  const dispatchRoutes = useMemo<DispatchRoute[]>(
    () =>
      activeDispatches
        .filter(
          (dispatch) =>
            dispatch.responderLatitude != null &&
            dispatch.responderLongitude != null &&
            dispatch.incidentLatitudeSnapshot != null &&
            dispatch.incidentLongitudeSnapshot != null,
        )
        .map((dispatch) => ({
          incidentId: dispatch.incidentId,
          responderId: dispatch.officialUserId?.toString() ?? dispatch.responderExternalId,
          responderLatitude: dispatch.responderLatitude as number,
          responderLongitude: dispatch.responderLongitude as number,
          incidentLatitude: dispatch.incidentLatitudeSnapshot as number,
          incidentLongitude: dispatch.incidentLongitudeSnapshot as number,
          distanceKm: dispatch.estimatedDistanceKm ?? 0,
        })),
    [activeDispatches],
  );

  const visibleOfficials = useMemo(
    () =>
      users.filter((user) => {
        const roleNames = user.roleNames ?? [];
        const isOfficial = roleNames.some((roleName) => OFFICIAL_ROLE_PATTERN.test(roleName));
        const isCitizen = roleNames.some((roleName) => CITIZEN_ROLE_PATTERN.test(roleName));
        return user.isActive && isOfficial && !isCitizen;
      }),
    [users],
  );

  const operationalResponders = useMemo<OperationalResponder[]>(() => {
    const latestByResponder = new Map<number, IDispatch>();

    [...dispatches]
      .filter(
        (dispatch) =>
          dispatch.responderLatitude != null &&
          dispatch.responderLongitude != null &&
          dispatch.officialUserId != null,
      )
      .sort((left, right) => {
        const leftDate = new Date(left.clearedAt ?? left.onSceneAt ?? left.enRouteAt ?? left.assignedAt).getTime();
        const rightDate = new Date(right.clearedAt ?? right.onSceneAt ?? right.enRouteAt ?? right.assignedAt).getTime();
        return rightDate - leftDate;
      })
      .forEach((dispatch) => {
        if (!latestByResponder.has(dispatch.officialUserId as number)) {
          latestByResponder.set(dispatch.officialUserId as number, dispatch);
        }
      });

    const statusByResponderId = new Map<number, ResponderStatus>();

    for (const dispatch of activeDispatches) {
      if (dispatch.officialUserId == null) continue;
      const nextStatus: ResponderStatus = dispatch.status === 'OnScene' ? 'On Scene' : 'En Route';
      statusByResponderId.set(dispatch.officialUserId, nextStatus);
    }

    return visibleOfficials.map((user) => {
      const dispatch = latestByResponder.get(user.id);
      const responderName = dispatch?.responderName ?? user.fullName ?? `${user.name} ${user.surname}`.trim();
      const lastUpdatedAt = dispatch?.clearedAt ?? dispatch?.onSceneAt ?? dispatch?.enRouteAt ?? dispatch?.assignedAt;
      const nameParts = responderName.split(/\s+/).filter(Boolean).slice(0, 2);
      const initials = nameParts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'NA';

      return {
        id: user.id.toString(),
        officialUserId: user.id,
        rank: dispatch?.responderRank ?? 'Official',
        name: responderName,
        sector: dispatch?.responderSector ?? 'No sector on record',
        status: statusByResponderId.get(user.id) ?? 'Available',
        latitude: dispatch?.responderLatitude ?? null,
        longitude: dispatch?.responderLongitude ?? null,
        initials,
        lastUpdatedMinutes: lastUpdatedAt
          ? Math.max(0, Math.floor((Date.now() - new Date(lastUpdatedAt).getTime()) / 60000))
          : 0,
      };
    });
  }, [activeDispatches, dispatches, visibleOfficials]);

  const mapResponders = useMemo<Responder[]>(
    () =>
      operationalResponders
        .filter((responder) => responder.latitude != null && responder.longitude != null)
        .map((responder) => ({
          ...responder,
          latitude: responder.latitude as number,
          longitude: responder.longitude as number,
        })),
    [operationalResponders],
  );

  const availableCount = operationalResponders.filter((item) => item.status === 'Available').length;
  const enRouteCount = operationalResponders.filter((item) => item.status === 'En Route').length;
  const highPriorityUnassigned = queueIncidents.filter((incident) => {
    const isHigh = derivePriority(incident) === 'HIGH';
    const hasRoute = dispatchByIncidentId.has(incident.id);
    return isHigh && !hasRoute;
  }).length;
  const canDispatch = operationalResponders.some(
    (item) => item.status === 'Available' && item.latitude != null && item.longitude != null,
  );

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

  const handleDispatch = async (incidentId: string) => {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident || incident.latitude == null || incident.longitude == null) {
      messageApi.error('This incident is missing coordinates, so it cannot be dispatched from the map.');
      return;
    }

    const currentDispatch = dispatchByIncidentId.get(incidentId);
    if (currentDispatch) {
      focusIncident(incident);
      return;
    }

    const availableResponders = operationalResponders.filter(
      (item): item is OperationalResponder & { latitude: number; longitude: number } =>
        item.status === 'Available' && item.latitude != null && item.longitude != null,
    );
    if (availableResponders.length === 0) {
      messageApi.error('No available officials can be dispatched yet. Add or migrate dispatch-linked officials first.');
      return;
    }

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
    }, null as { responder: OperationalResponder; distance: number } | null);

    if (!nearestResponder) {
      messageApi.error('Unable to determine the nearest official for this incident.');
      return;
    }

    const created = await createDispatch({
      incidentId,
      caseId: incident.caseId,
      officialUserId: nearestResponder.responder.officialUserId,
      status: 'EnRoute',
      responderExternalId: nearestResponder.responder.id,
      responderRank: nearestResponder.responder.rank,
      responderName: nearestResponder.responder.name,
      responderSector: nearestResponder.responder.sector,
      responderLatitude: nearestResponder.responder.latitude,
      responderLongitude: nearestResponder.responder.longitude,
      incidentLatitudeSnapshot: incident.latitude,
      incidentLongitudeSnapshot: incident.longitude,
      estimatedDistanceKm: Number(nearestResponder.distance.toFixed(1)),
      assignedAt: new Date().toISOString(),
      enRouteAt: new Date().toISOString(),
      assignmentSource: 'Manual',
      notes: 'Created from Alerts & Dispatch board',
    });

    if (!created) {
      messageApi.error('Dispatch creation failed. Check that the database migration is applied and the user has the Official role.');
      return;
    }

    messageApi.success('Dispatch created.');
    focusIncident(incident);
  };

  const handleViewOnMap = (incident: IIncident) => {
    focusIncident(incident);
  };

  const mapProps: AlertsMapProps = {
    incidents: queueIncidents,
    responders: mapResponders,
    routes: dispatchRoutes,
    focusTarget,
    centerTrigger,
    showRoadblocks,
    roadblocks,
    onDispatch: handleDispatch,
    onFocusHandled: () => setFocusTarget(null),
    onBoundsChange: setMapBounds,
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
      popupButton: token.colorPrimary,
      popupButtonText: token.colorWhite,
      popupMutedText: token.colorTextSecondary,
      popupSurface: token.colorBgElevated,
      popupBorder: token.colorBorderSecondary,
    },
  };

  return (
    <div className={styles.page}>
      {contextHolder}
      <div className={cx(styles.panel, styles.leftPanel)}>
        <div className={styles.leftScroll}>
          <div className={styles.headerBlock}>
            <Title level={3} className={styles.pageTitle}>
              Alerts &amp; Dispatch
            </Title>
            <Text type="secondary">
              Live command view for active incidents, responder availability, and field constraints.
            </Text>
            {!canDispatch && (
              <div>
                <Text type="warning">
                  Dispatching is currently unavailable because no available dispatch-linked officials were found.
                </Text>
              </div>
            )}
          </div>

          <div className={styles.statsGrid}>
            <Card size="small" className={styles.statCard}>
              <Statistic title="Active incidents" value={queueIncidents.length} loading={incidentsPending || dispatchesPending} />
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
                  const dispatch = dispatchByIncidentId.get(incident.id);
                  const route = dispatchRoutes.find((item) => item.incidentId === incident.id);
                  const priority = derivePriority(incident);
                  const statusLabel = getStatusLabel(dispatch);
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
                              disabled={!hasCoordinates || !!route || !canDispatch}
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

          <Card title="Responders" className={styles.sectionCard}>
            <div>
              {operationalResponders.length === 0 ? (
                <Text type="secondary">No responders available from dispatch history yet.</Text>
              ) : (
                operationalResponders.map((responder) => (
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
                ))
              )}
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
                icon={<WarningOutlined />}
                onClick={() => setShowRoadblocks((value) => !value)}
                type={showRoadblocks ? 'primary' : 'default'}
              >
                Roadblocks
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  void Promise.all(
                    activeDispatches.map((dispatch) =>
                      transitionStatus({ id: dispatch.id, toStatus: 'Cancelled', notes: 'Cleared from alerts board' }),
                    ),
                  );
                }}
                disabled={activeDispatches.length === 0}
              >
                Clear routes
              </Button>
              <Button icon={<CompassOutlined />} onClick={() => setCenterTrigger((value) => value + 1)}>
                Center map
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
}
