'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Space, Spin, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useCaseAction, useCaseState } from '@/providers/cases-provider';

const { Title, Text, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  card: css`
    border-color: ${token.colorBorderSecondary};
  `,
}));

export default function CaseDetailPage() {
  const { styles } = useStyles();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { items, selected, isPending } = useCaseState();
  const { fetchById, fetchAll } = useCaseAction();

  const caseId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!caseId) return;
    fetchById(caseId);
    fetchAll({ skipCount: 0, maxResultCount: 1000 });
  }, [caseId, fetchAll, fetchById]);

  const caseItem = useMemo(() => {
    if (selected?.id === caseId) return selected;
    return items.find((item) => item.id === caseId);
  }, [caseId, items, selected]);

  return (
    <div className={styles.page}>
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/cases')}>
          Back to cases
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Case detail
        </Title>
      </Space>

      <Card className={styles.card}>
        {isPending && !caseItem ? (
          <Spin />
        ) : caseItem ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <div>
              <Space wrap>
                <Tag color="processing">{caseItem.status}</Tag>
                <Tag color={caseItem.severity === 'Critical' ? 'error' : caseItem.severity === 'High' ? 'warning' : 'default'}>
                  {caseItem.severity}
                </Tag>
              </Space>
              <Title level={4} style={{ marginBottom: 4 }}>
                {caseItem.caseNumber}
              </Title>
              <Text type="secondary">{caseItem.title}</Text>
            </div>

            {caseItem.summary && <Paragraph>{caseItem.summary}</Paragraph>}

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Category">{caseItem.category ?? 'Uncategorised'}</Descriptions.Item>
              <Descriptions.Item label="Opened">{new Date(caseItem.openedAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Last activity">
                {new Date(caseItem.lastActivityAt ?? caseItem.creationTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Linked incidents">{caseItem.incidentCount}</Descriptions.Item>
              <Descriptions.Item label="Court ready">{caseItem.isCourtReady ? 'Yes' : 'No'}</Descriptions.Item>
              <Descriptions.Item label="Closure reason">{caseItem.closureReason ?? 'Not closed'}</Descriptions.Item>
            </Descriptions>
          </Space>
        ) : (
          <Text type="secondary">Case not found.</Text>
        )}
      </Card>
    </div>
  );
}
