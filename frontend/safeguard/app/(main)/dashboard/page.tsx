'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Card, Col, Grid, Row, Segmented, Spin, Statistic, Tag, theme, Typography, message } from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EyeInvisibleOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';
import { getAxiosInstance } from '@/utils/axiosInstance';
import type { IIncident } from '@/providers/incidents-provider/context';
import { useAuthState } from '@/providers/auth-provider';
import { useDispatchAction, useDispatchState } from '@/providers/dispatch-provider';
import { useStyles } from './styles/style';

const { Text } = Typography;

type TrendRangeKey = '7d' | '30d' | '90d' | '365d' | 'all';
type TrendFilterKey = 'all' | 'anonymous' | 'media';

const TREND_RANGE_OPTIONS: { label: string; value: TrendRangeKey }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '12 months', value: '365d' },
  { label: 'All time', value: 'all' },
];

const TREND_FILTER_OPTIONS: { label: string; value: TrendFilterKey }[] = [
  { label: 'All incidents', value: 'all' },
  { label: 'Anonymous only', value: 'anonymous' },
  { label: 'With media', value: 'media' },
];

const BASE = '/api/services/app/incident';

function MapLoading() {
  const { styles } = useStyles();
  return <div className={styles.mapLoadingContainer}>Loading map...</div>;
}

const IncidentHeatmap = dynamic(() => import('../../../components/Map/IncidentHeatmap'), {
  ssr: false,
  loading: () => <MapLoading />,
});

function getPriorityBucket(incident: IIncident): 'HIGH' | 'MEDIUM' | 'LOW' | null {
  if (incident.priorityTag === 'HIGH' || incident.priorityTag === 'MEDIUM' || incident.priorityTag === 'LOW') {
    return incident.priorityTag;
  }

  if (incident.caseLikelihood != null) {
    if (incident.caseLikelihood >= 0.75) {
      return 'HIGH';
    }

    if (incident.caseLikelihood >= 0.25) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  const haystack = `${incident.title} ${incident.description}`.toLowerCase();
  if (/(gun|shoot|armed|fire|explosion|attack|assault|hijack|critical)/.test(haystack)) {
    return 'HIGH';
  }

  if (/(fight|suspicious|theft|robbery|crowd|traffic|break)/.test(haystack)) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function buildTrendData(incidents: IIncident[], range: TrendRangeKey) {
  const now = dayjs().startOf('day');
  const unit = range === '365d' || range === 'all' ? 'month' : 'day';
  const format = unit === 'month' ? 'MMM YYYY' : 'MMM D';
  const stepCount =
    range === '7d' ? 7 :
    range === '30d' ? 30 :
    range === '90d' ? 90 :
    range === '365d' ? 12 :
    Math.max(
      1,
      now.diff(
        incidents.reduce((earliest, incident) => {
          const occurredAt = dayjs(incident.occurredAt);
          return occurredAt.isBefore(earliest) ? occurredAt : earliest;
        }, now),
        'month',
      ) + 1,
    );

  const counts: Record<string, number> = {};

  for (let index = stepCount - 1; index >= 0; index--) {
    const label =
      unit === 'month'
        ? now.subtract(index, 'month').startOf('month').format(format)
        : now.subtract(index, 'day').format(format);
    counts[label] = 0;
  }

  incidents.forEach((incident) => {
    const occurredAt = dayjs(incident.occurredAt);
    const label = unit === 'month' ? occurredAt.startOf('month').format(format) : occurredAt.format(format);
    if (label in counts) {
      counts[label] += 1;
    }
  });

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

function filterTrendIncidents(incidents: IIncident[], filter: TrendFilterKey) {
  if (filter === 'anonymous') {
    return incidents.filter((incident) => incident.anonymous);
  }

  if (filter === 'media') {
    return incidents.filter((incident) => incident.hasAudio || incident.hasImage);
  }

  return incidents;
}

export default function Dashboard() {
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuthState();
  const { items: dispatches } = useDispatchState();
  const { fetchAll: fetchDispatches, completeMine, transitionStatus } = useDispatchAction();

  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
  const [trendRange, setTrendRange] = useState<TrendRangeKey>('30d');
  const [trendFilter, setTrendFilter] = useState<TrendFilterKey>('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await getAxiosInstance().get(`${BASE}/GetAll`, {
          params: { skipCount: 0, maxResultCount: 10000 },
        });
        setIncidents(res.data.result.items ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    void fetchDispatches({ skipCount: 0, maxResultCount: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myActiveDispatch = useMemo(
    () =>
      dispatches
        .filter(
          (dispatch) =>
            dispatch.officialUserId === user?.userId &&
            ['Dispatched', 'EnRoute', 'OnScene'].includes(dispatch.status),
        )
        .sort((left, right) => new Date(right.assignedAt).getTime() - new Date(left.assignedAt).getTime())[0] ?? null,
    [dispatches, user?.userId],
  );

  const totalCount = incidents.length;
  const withGps = useMemo(() => incidents.filter((incident) => incident.latitude != null && incident.longitude != null).length, [incidents]);
  const anonymousCount = useMemo(() => incidents.filter((incident) => incident.anonymous).length, [incidents]);
  const withMedia = useMemo(() => incidents.filter((incident) => incident.hasAudio || incident.hasImage).length, [incidents]);

  const filteredTrendIncidents = useMemo(
    () => filterTrendIncidents(incidents, trendFilter),
    [incidents, trendFilter],
  );
  const trendData = useMemo(
    () => buildTrendData(filteredTrendIncidents, trendRange),
    [filteredTrendIncidents, trendRange],
  );
  const trendTotal = useMemo(() => trendData.reduce((sum, item) => sum + item.count, 0), [trendData]);
  const trendPeak = useMemo(() => trendData.reduce((peak, item) => Math.max(peak, item.count), 0), [trendData]);
  const trendAverage = trendData.length > 0 ? (trendTotal / trendData.length).toFixed(1) : '0.0';

  const mediaData = useMemo(() => {
    let audio = 0;
    let image = 0;
    let both = 0;
    let none = 0;

    incidents.forEach((incident) => {
      if (incident.hasAudio && incident.hasImage) both += 1;
      else if (incident.hasAudio) audio += 1;
      else if (incident.hasImage) image += 1;
      else none += 1;
    });

    return [
      { name: 'Image + Audio', value: both, fill: '#0f766e' },
      { name: 'Image only', value: image, fill: '#0ea5e9' },
      { name: 'Audio only', value: audio, fill: '#22c55e' },
      { name: 'No media', value: none, fill: '#334155' },
    ].filter((item) => item.value > 0);
  }, [incidents]);

  const priorityData = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;

    incidents.forEach((incident) => {
      const priority = getPriorityBucket(incident);
      if (priority === 'HIGH') high += 1;
      else if (priority === 'MEDIUM') medium += 1;
      else if (priority === 'LOW') low += 1;
    });

    const total = high + medium + low;
    if (total === 0) return [];

    const percent = (value: number) => Math.round((value / total) * 100);

    return [
      { name: 'High', value: high, fill: token.colorError, label: `High ${high} (${percent(high)}%)` },
      { name: 'Medium', value: medium, fill: token.colorWarning, label: `Medium ${medium} (${percent(medium)}%)` },
      { name: 'Low', value: low, fill: '#64748b', label: `Low ${low} (${percent(low)}%)` },
    ].filter((item) => item.value > 0);
  }, [incidents, token]);

  const anonData = useMemo(
    () => [
      { name: 'Identified', value: totalCount - anonymousCount, fill: '#2563eb' },
      { name: 'Anonymous', value: anonymousCount, fill: '#0f172a' },
    ].filter((item) => item.value > 0),
    [anonymousCount, totalCount],
  );

  const handleMarkOnScene = async () => {
    if (!myActiveDispatch) return;

    setDispatchSubmitting(true);
    const updated = await transitionStatus({
      id: myActiveDispatch.id,
      toStatus: 'OnScene',
      notes: 'Responder marked dispatch as on scene from dashboard',
    });
    setDispatchSubmitting(false);

    if (!updated) {
      messageApi.error('Unable to update dispatch status right now.');
      return;
    }

    messageApi.success('Dispatch marked as on scene.');
  };

  const handleCompleteDispatch = async () => {
    if (!myActiveDispatch) return;

    setDispatchSubmitting(true);
    const completed = await completeMine(myActiveDispatch.id);
    setDispatchSubmitting(false);

    if (!completed) {
      messageApi.error('Unable to complete your dispatch right now.');
      return;
    }

    messageApi.success('Dispatch completed. You are now available for reassignment.');
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  const statSuffix = totalCount > 0 ? <span className={styles.statSuffix}>/ {totalCount}</span> : undefined;
  const trendLabel = TREND_RANGE_OPTIONS.find((option) => option.value === trendRange)?.label ?? '30 days';
  const trendFilterLabel = TREND_FILTER_OPTIONS.find((option) => option.value === trendFilter)?.label ?? 'All incidents';
  const angledTicks = trendRange === '365d' || trendRange === 'all';

  return (
    <div className={styles.pageWrapper}>
      {contextHolder}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Operations Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Live situational overview for reporting volume, field readiness, and media quality.
          </p>
        </div>
        <div className={styles.headerBadgeRow}>
          <Tag color={myActiveDispatch ? 'processing' : 'success'}>
            {myActiveDispatch ? 'Responder engaged' : 'Responder ready'}
          </Tag>
        </div>
      </div>

      <Card className={styles.heroCard}>
        <div className={styles.heroGrid}>
          <div>
            <div className={styles.heroEyebrow}>Command snapshot</div>
            <div className={styles.heroTitle}>See operational load, route readiness, and reporting quality at a glance.</div>
            <div className={styles.heroText}>
              Expand the incident trend horizon, monitor your own dispatch state, and use the heatmap to spot where activity is clustering.
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{totalCount}</span>
              <span className={styles.heroStatLabel}>Incidents loaded</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{withGps}</span>
              <span className={styles.heroStatLabel}>With coordinates</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{myActiveDispatch ? '1' : '0'}</span>
              <span className={styles.heroStatLabel}>My live dispatches</span>
            </div>
          </div>
        </div>
      </Card>

      {user && (
        <Card className={styles.card} style={{ marginBottom: 24 }}>
          {myActiveDispatch ? (
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={16}>
                <p className={styles.sectionLabel}>My active dispatch</p>
                <div className={styles.dispatchMeta}>
                  <Text strong>{myActiveDispatch.incidentTitle ?? 'Assigned incident'}</Text>
                  <Text type="secondary">{myActiveDispatch.caseNumber ? `Case ${myActiveDispatch.caseNumber}` : 'No linked case yet'}</Text>
                  <Text type="secondary">Assigned {dayjs(myActiveDispatch.assignedAt).format('MMM D, YYYY h:mm A')}</Text>
                  <div>
                    <Tag color={myActiveDispatch.status === 'OnScene' ? 'error' : 'processing'}>
                      {myActiveDispatch.status === 'OnScene' ? 'On Scene' : 'En Route'}
                    </Tag>
                    {myActiveDispatch.estimatedDistanceKm != null && (
                      <Tag>{myActiveDispatch.estimatedDistanceKm.toFixed(1)} km route</Tag>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <div className={styles.dispatchActions}>
                  {myActiveDispatch.status !== 'OnScene' && (
                    <Button onClick={() => void handleMarkOnScene()} loading={dispatchSubmitting}>
                      On scene
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => void handleCompleteDispatch()}
                    loading={dispatchSubmitting}
                  >
                    Complete dispatch
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={16}>
                <p className={styles.sectionLabel}>My active dispatch</p>
                <Text type="secondary">
                  No active dispatch assigned to you right now. New assignments will appear here automatically.
                </Text>
              </Col>
              <Col xs={24} lg={8}>
                <div className={styles.dispatchActions}>
                  <Tag color="success">Available</Tag>
                </div>
              </Col>
            </Row>
          )}
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Total incidents"
              value={totalCount}
              prefix={<AlertOutlined style={{ color: '#2563eb' }} />}
              styles={{ content: { color: '#0f172a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="With GPS location"
              value={withGps}
              prefix={<EnvironmentOutlined style={{ color: '#10b981' }} />}
              styles={{ content: { color: '#0f172a' } }}
              suffix={statSuffix}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Anonymous reports"
              value={anonymousCount}
              prefix={<EyeInvisibleOutlined style={{ color: '#f59e0b' }} />}
              styles={{ content: { color: '#0f172a' } }}
              suffix={statSuffix}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="With media"
              value={withMedia}
              prefix={<FileImageOutlined style={{ color: '#0f766e' }} />}
              styles={{ content: { color: '#0f172a' } }}
              suffix={statSuffix}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card className={styles.card} style={{ height: '100%' }}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.sectionLabel}>Incident trend</p>
                <div className={styles.chartTitleRow}>
                  <span className={styles.chartTitle}>{trendLabel}</span>
                  <Tag color="blue">{trendFilterLabel}</Tag>
                  <Tag>{trendTotal} incidents</Tag>
                  <Tag color="geekblue">Peak {trendPeak}</Tag>
                  <Tag color="cyan">Avg {trendAverage}</Tag>
                </div>
              </div>
              <div className={styles.chartControls}>
                <Segmented
                  options={TREND_FILTER_OPTIONS}
                  value={trendFilter}
                  onChange={(value) => setTrendFilter(value as TrendFilterKey)}
                  size={isMobile ? 'small' : 'middle'}
                />
                <Segmented
                  options={TREND_RANGE_OPTIONS}
                  value={trendRange}
                  onChange={(value) => setTrendRange(value as TrendRangeKey)}
                  size={isMobile ? 'small' : 'middle'}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
              <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={isMobile ? 'preserveStartEnd' : angledTicks ? 0 : 4}
                  angle={angledTicks ? -18 : 0}
                  textAnchor={angledTicks ? 'end' : 'middle'}
                  height={angledTicks ? 56 : 30}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" name="Incidents" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]} style={{ height: '100%' }}>
            <Col xs={24} sm={12} lg={24}>
              <Card className={styles.card}>
                <p className={styles.sectionLabel}>Reporter identity</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={anonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={24}>
              <Card className={styles.card}>
                <p className={styles.sectionLabel}>Media attachments</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={mediaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Card className={styles.card} style={{ marginBottom: 24 }}>
        <p className={styles.sectionLabel}>AI priority distribution</p>
        <p className={styles.chartSupportText}>
          Based on AI priority tags and probability scores across all loaded incidents.
        </p>
        {priorityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 180}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(value, name) => [typeof value === 'number' ? value : 0, String(name ?? '')]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: isMobile ? 11 : 12 }}
                formatter={(_value, entry) => {
                  const item = priorityData.find((priority) => priority.name === entry.value);
                  return item?.label ?? entry.value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyState}>
            No AI priority data is available for the incidents currently loaded into the dashboard.
          </div>
        )}
      </Card>

      <Card className={styles.card}>
        <p className={styles.sectionLabel}>Incident heatmap</p>
        {withGps === 0 ? (
          <div className={styles.heatmapEmpty}>
            No incidents with GPS coordinates yet.
          </div>
        ) : (
          <div className={styles.heatmapContainer}>
            <IncidentHeatmap incidents={incidents} />
          </div>
        )}
      </Card>
    </div>
  );
}
