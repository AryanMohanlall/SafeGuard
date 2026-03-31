'use client';

import { Badge, Card, Empty, List, Tag, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useAlerts } from '@/providers/alert-provider';

const { Title, Text } = Typography;

const AlertsPage = () => {
  const { alerts } = useAlerts();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Live Alerts</Title>
        <Badge count={alerts.length} color="#2563eb" />
      </div>

      {alerts.length === 0 ? (
        <Card>
          <Empty
            image={<BellOutlined style={{ fontSize: 48, color: '#94a3b8' }} />}
            imageStyle={{ height: 60 }}
            description="No alerts yet — new incidents will appear here in real time."
          />
        </Card>
      ) : (
        <List
          dataSource={alerts}
          renderItem={(alert) => (
            <List.Item key={alert.id} style={{ padding: 0, marginBottom: 12 }}>
              <Card style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>{alert.title}</Text>
                    <div style={{ marginTop: 4, color: '#64748b' }}>
                      <Text type="secondary">{alert.location}</Text>
                    </div>
                    <div style={{ marginTop: 4, color: '#64748b' }}>
                      <Text type="secondary">{new Date(alert.occurredAt).toLocaleString()}</Text>
                    </div>
                  </div>
                  <Tag color={alert.anonymous ? 'default' : 'blue'}>
                    {alert.anonymous ? 'Anonymous' : 'Identified'}
                  </Tag>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default AlertsPage;
