'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Input, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ApartmentOutlined, ReloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { IncidentSuggestionGraph } from '@/components/safeguard/IncidentSuggestionGraph';
import {
  useIncidentClusteringAction,
  useIncidentClusteringState,
} from '@/providers/incident-clustering-provider';
import type { ISuggestedIncidentCase } from '@/providers/incident-clustering-provider/context';

const { Paragraph, Text } = Typography;

const columns: ColumnsType<ISuggestedIncidentCase> = [
  {
    title: 'Suggested case',
    dataIndex: 'suggestedTitle',
    key: 'suggestedTitle',
    render: (value: string, record) => (
      <div>
        <div style={{ fontWeight: 700, color: '#0f172a' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
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

export default function IncidentGraphPage() {
  const { graph, trainingResult, isPending, isError, isRegenerating } = useIncidentClusteringState();
  const { fetchGraph, regenerateModel } = useIncidentClusteringAction();
  const [csvPath, setCsvPath] = useState('');

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
    <div style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 30, color: '#0f172a' }}>Incident Link Graph</h1>
          <Paragraph style={{ marginTop: 8, marginBottom: 0, maxWidth: 760, color: '#475569' }}>
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

      <Card>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Text strong>Training CSV Override</Text>
          <Input
            value={csvPath}
            onChange={(event) => setCsvPath(event.target.value)}
            placeholder="Optional. Leave blank to use the configured Downloads incident-training-data.csv path."
          />
          {trainingResult && (
            <Alert
              type="success"
              showIcon
              message={`Model regenerated from ${trainingResult.recordsRead} CSV rows using ${trainingResult.clusterCount} clusters.`}
              description={trainingResult.modelPath}
            />
          )}
          {isError && (
            <Alert
              type="error"
              showIcon
              message="The graph request failed."
              description="Check that the clustering model exists or regenerate it from the CSV file."
            />
          )}
        </Space>
      </Card>

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
        title="Graph View"
        extra={graph?.generatedAt ? <Text type="secondary">Updated {new Date(graph.generatedAt).toLocaleString()}</Text> : null}
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
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <Text strong>Linked incidents</Text>
                  <div style={{ marginTop: 6 }}>
                    {record.incidentIds.map((incidentId) => (
                      <Tag key={incidentId}>{incidentId}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <Text strong>Why this was suggested</Text>
                  <ul style={{ margin: '8px 0 0 18px', color: '#475569' }}>
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
