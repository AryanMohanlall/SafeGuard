'use client';

import { useEffect } from 'react';
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ApartmentOutlined, ReloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { IncidentSuggestionGraph } from '@/components/safeguard/IncidentSuggestionGraph';
import {
  useIncidentClusteringAction,
  useIncidentClusteringState,
} from '@/providers/incident-clustering-provider';
import type { ISuggestedIncidentCase } from '@/providers/incident-clustering-provider/context';
import { useStyles } from './styles/style';

const { Paragraph, Text } = Typography;

export default function IncidentGraphPage() {
  const { styles } = useStyles();
  const { graph, isPending, isRegenerating } = useIncidentClusteringState();
  const { fetchGraph, regenerateModel } = useIncidentClusteringAction();
  const csvPath = '';

  const columns: ColumnsType<ISuggestedIncidentCase> = [
    {
      title: 'Suggested case',
      dataIndex: 'suggestedTitle',
      key: 'suggestedTitle',
      render: (value: string, record) => (
        <div>
          <div className={styles.cellTitle}>{value}</div>
          <div className={styles.cellMeta}>
            Cluster {record.clusterId} - {record.incidentIds.length} incidents
          </div>
        </div>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidenceScore',
      key: 'confidenceScore',
      width: 140,
      render: (value: number) => (
        <Tag color={value >= 0.8 ? 'green' : value >= 0.65 ? 'blue' : 'gold'}>
          {Math.round(value * 100)}%
        </Tag>
      ),
    },
    {
      title: 'Signals',
      key: 'signals',
      render: (_, record) => (
        <Space wrap size={[6, 6]}>
          <Tag>{record.dominantCategory}</Tag>
          <Tag color="purple">{record.dominantObject}</Tag>
          <Tag color="geekblue">{record.maxDistanceKm.toFixed(1)} km</Tag>
          <Tag color="cyan">{record.timeSpanHours.toFixed(1)} hrs</Tag>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await fetchGraph({ csvPath: csvPath || null });
  };

  const handleRetrain = async () => {
    try {
      await regenerateModel({ csvPath: csvPath || null });
      await fetchGraph({ csvPath: csvPath || null });
      message.success('Incident clustering model regenerated.');
    } catch {
      message.error('Failed to regenerate the clustering model.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Incident Link Graph</h1>
          <Paragraph className={styles.pageSubtitle}>
            KMeans groups incidents using location, time, title-derived category, and detected objects. Suggested cases are then scored in business logic so investigators can review patterns before creating a real case.
          </Paragraph>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isPending}>
            Refresh graph
          </Button>
          <Button
            type="primary"
            icon={<ShareAltOutlined />}
            onClick={handleRetrain}
            loading={isRegenerating}
          >
            Regenerate from CSV
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Incidents analysed" value={graph?.incidentCount ?? 0} prefix={<ApartmentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Suggestion clusters" value={graph?.clusterCount ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Suggested cases" value={graph?.suggestionCount ?? 0} />
          </Card>
        </Col>
      </Row>

      <Card
        className={styles.graphCard}
        title="Graph View"
        extra={graph?.generatedAt ? <Text type="secondary">Updated {new Date(graph.generatedAt).toLocaleString()}</Text> : null}
        styles={{ body: { padding: 0 } }}
      >
        <IncidentSuggestionGraph nodes={graph?.nodes ?? []} edges={graph?.edges ?? []} />
      </Card>

      <Card title="Suggested Cases">
        <Table<ISuggestedIncidentCase>
          rowKey="id"
          loading={isPending}
          columns={columns}
          dataSource={graph?.suggestions ?? []}
          pagination={false}
          scroll={{ x: 'max-content' }}
          expandable={{
            expandedRowRender: (record) => (
              <div className={styles.expandedRow}>
                <div>
                  <Text strong>Linked incidents</Text>
                  <div className={styles.expandedIncidentIds}>
                    {record.incidentIds.map((incidentId) => (
                      <Tag key={incidentId}>{incidentId}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <Text strong>Why this was suggested</Text>
                  <ul className={styles.reasonList}>
                    {record.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ),
          }}
          locale={{ emptyText: 'No reviewable suggestions yet. Regenerate the model or add more incidents.' }}
        />
      </Card>
    </div>
  );
}
