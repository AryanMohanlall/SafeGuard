'use client';

import { Modal, Tag, Descriptions } from 'antd';
import { useAlerts } from '@/providers/alert-provider';

export const AlertModal = () => {
  const { pending, dismiss } = useAlerts();

  return (
    <Modal
      open={pending !== null}
      title="New Incident Reported"
      onOk={dismiss}
      onCancel={dismiss}
      okText="View"
      cancelText="Dismiss"
    >
      {pending && (
        <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
          <Descriptions.Item label="Title">{pending.title}</Descriptions.Item>
          <Descriptions.Item label="Location">{pending.location}</Descriptions.Item>
          <Descriptions.Item label="Occurred At">
            {new Date(pending.occurredAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Reporter">
            {pending.anonymous ? <Tag color="default">Anonymous</Tag> : <Tag color="blue">Identified</Tag>}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};
