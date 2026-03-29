'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, Col, Row, Spin, Statistic } from 'antd';
import {
  AlertOutlined,
  EnvironmentOutlined,
  EyeInvisibleOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { useStyles } from './styles/style';

function MapLoading() {
  const { styles } = useStyles();
  return <div className={styles.mapLoadingContainer}>Loading map…</div>;
}

const IncidentHeatmap = dynamic(() => import('../../../components/Map/IncidentHeatmap'), {
  ssr: false,
  loading: () => <MapLoading />,
});

const BASE = '/api/services/app/incident';

export default function Dashboard() {
  const { styles } = useStyles();

  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCount = incidents.length;
  const withGps = useMemo(
    () => incidents.filter((i) => i.latitude != null && i.longitude != null).length,
    [incidents],
  );
  const anonymousCount = useMemo(() => incidents.filter((i) => i.anonymous).length, [incidents]);
  const withMedia = useMemo(
    () => incidents.filter((i) => i.hasAudio || i.hasImage).length,
    [incidents],
  );

  // ── Incidents per day (last 30 days) ───────────────────────────────────────
  const dailyData = useMemo(() => {
    const counts: Record<string, number> = {};
    const today = dayjs().startOf('day');
    for (let d = 29; d >= 0; d--) {
      counts[today.subtract(d, 'day').format('MMM D')] = 0;
    }
    incidents.forEach((i) => {
      const key = dayjs(i.occurredAt).format('MMM D');
      if (key in counts) counts[key]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [incidents]);

  // ── Media breakdown pie ────────────────────────────────────────────────────
  const mediaData = useMemo(() => {
    let audio = 0, image = 0, both = 0, none = 0;
    incidents.forEach((i) => {
      if (i.hasAudio && i.hasImage) both++;
      else if (i.hasAudio) audio++;
      else if (i.hasImage) image++;
      else none++;
    });
    return [
      { name: 'Image + Audio', value: both,  fill: '#8b5cf6' },
      { name: 'Image only',    value: image, fill: '#06b6d4' },
      { name: 'Audio only',    value: audio, fill: '#10b981' },
      { name: 'No media',      value: none,  fill: '#060b10' },
    ].filter((d) => d.value > 0);
  }, [incidents]);

  // ── Anonymous vs Identified pie ────────────────────────────────────────────
  const anonData = useMemo(
    () => [
      { name: 'Identified', value: totalCount - anonymousCount, fill: '#2563eb' },
      { name: 'Anonymous',  value: anonymousCount,              fill: '#090e15' },
    ].filter((d) => d.value > 0),
    [totalCount, anonymousCount],
  );

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  const statSuffix = totalCount > 0
    ? <span className={styles.statSuffix}>/ {totalCount}</span>
    : undefined;

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Total Incidents"
              value={totalCount}
              prefix={<AlertOutlined style={{ color: '#2563eb' }} />}
              styles={{ content: { color: '#0f172a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="With GPS Location"
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
              title="Anonymous Reports"
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
              title="With Media"
              value={withMedia}
              prefix={<FileImageOutlined style={{ color: '#8b5cf6' }} />}
              styles={{ content: { color: '#0f172a' } }}
              suffix={statSuffix}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Incidents over time */}
        <Col xs={24} lg={14}>
          <Card className={styles.card} style={{ height: '100%' }}>
            <p className={styles.sectionLabel}>Incidents — Last 30 Days</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
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
                <Bar dataKey="count" name="Incidents" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pie charts */}
        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]} style={{ height: '100%' }}>
            <Col xs={24} sm={12} lg={24}>
              <Card className={styles.card}>
                <p className={styles.sectionLabel}>Reporter Identity</p>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={anonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={24}>
              <Card className={styles.card}>
                <p className={styles.sectionLabel}>Media Attachments</p>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={mediaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Heatmap */}
      <Card className={styles.card}>
        <p className={styles.sectionLabel}>Incident Heatmap</p>
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
