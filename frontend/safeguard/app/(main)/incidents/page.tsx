'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStyles } from './styles/style';
import { useIncidentState, useIncidentAction } from '@/providers/incidents-provider';
import type { IIncident, ICreateIncidentInput, IUpdateIncidentInput } from '@/providers/incidents-provider/context';

const { TextArea } = Input;

type DrawerMode = 'create' | 'edit' | 'view';

interface IncidentFormValues {
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  anonymous: boolean;
  occurredAt: dayjs.Dayjs;
  reportedAt: dayjs.Dayjs;
}

const IncidentsPage = () => {
  const { styles } = useStyles();
  const { items, isPending, totalCount } = useIncidentState();
  const { fetchAll, create, update, remove } = useIncidentAction();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const [activeIncident, setActiveIncident] = useState<IIncident | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [form] = Form.useForm<IncidentFormValues>();

  useEffect(() => {
    fetchAll({ skipCount: 0, maxResultCount: pageSize });
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ reportedAt: dayjs(), anonymous: false });
    setAnonymous(false);
    setActiveIncident(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEdit = (incident: IIncident) => {
    form.setFieldsValue({
      title: incident.title,
      description: incident.description,
      location: incident.location,
      latitude: incident.latitude,
      longitude: incident.longitude,
      anonymous: incident.anonymous,
      occurredAt: dayjs(incident.occurredAt),
      reportedAt: dayjs(incident.reportedAt),
    });
    setAnonymous(incident.anonymous);
    setActiveIncident(incident);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openView = (incident: IIncident) => {
    setActiveIncident(incident);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveIncident(null);
  };

  const handleSubmit = async (values: IncidentFormValues) => {
    if (drawerMode === 'create') {
      const input: ICreateIncidentInput = {
        title: values.title,
        description: values.description,
        location: values.location,
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
        anonymous: values.anonymous ?? false,
        occurredAt: values.occurredAt.toISOString(),
        reportedAt: values.reportedAt.toISOString(),
      };
      create(input);
      message.success('Incident created.');
    } else if (drawerMode === 'edit' && activeIncident) {
      const input: IUpdateIncidentInput = {
        id: activeIncident.id,
        title: values.title,
        description: values.description,
        location: values.location,
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
        anonymous: values.anonymous ?? false,
        occurredAt: values.occurredAt.toISOString(),
        reportedAt: values.reportedAt.toISOString(),
      };
      update(activeIncident.id, input);
      message.success('Incident updated.');
    }
    closeDrawer();
    fetchAll({ skipCount: (page - 1) * pageSize, maxResultCount: pageSize });
  };

  const handleDelete = (id: string) => {
    remove(id);
    message.success('Incident deleted.');
    fetchAll({ skipCount: (page - 1) * pageSize, maxResultCount: pageSize });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchAll({ skipCount: (newPage - 1) * pageSize, maxResultCount: pageSize });
  };

  const columns: TableColumnsType<IIncident> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <span style={{ fontWeight: 500, color: '#1e293b' }}>{title}</span>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
      render: (location: string) => (
        <span>
          <EnvironmentOutlined style={{ color: '#94a3b8', marginRight: 6 }} />
          {location}
        </span>
      ),
    },
    {
      title: 'Occurred',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      width: 160,
      render: (val: string) => dayjs(val).format('DD MMM YYYY HH:mm'),
    },
    {
      title: 'Anonymous',
      dataIndex: 'anonymous',
      key: 'anonymous',
      width: 110,
      render: (val: boolean) =>
        val ? (
          <Tag color="orange">Anonymous</Tag>
        ) : (
          <Tag color="default">Identified</Tag>
        ),
    },
    {
      title: 'Media',
      key: 'media',
      width: 90,
      render: (_: unknown, record: IIncident) => (
        <Space size={4}>
          {record.hasAudio && <Tag color="blue">Audio</Tag>}
          {record.hasImage && <Tag color="purple">Image</Tag>}
          {!record.hasAudio && !record.hasImage && <span style={{ color: '#cbd5e1' }}>—</span>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_: unknown, record: IIncident) => (
        <div className={styles.tableActions}>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete incident?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const drawerTitle =
    drawerMode === 'create'
      ? 'New Incident'
      : drawerMode === 'edit'
      ? 'Edit Incident'
      : 'Incident Details';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Incidents</h1>
          <p className={styles.pageSubtitle}>Manage and review all reported incidents.</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ background: '#2563eb', borderColor: '#2563eb' }}
          onClick={openCreate}
        >
          New Incident
        </Button>
      </div>

      <div className={styles.card}>
        <Table<IIncident>
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={isPending}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: handlePageChange,
            showSizeChanger: false,
            showTotal: (total) => `${total} incidents`,
          }}
          size="middle"
        />
      </div>

      <Drawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={closeDrawer}
        width={520}
        footer={
          drawerMode !== 'view' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={closeDrawer}>Cancel</Button>
              <Button
                type="primary"
                style={{ background: '#2563eb', borderColor: '#2563eb' }}
                onClick={() => form.submit()}
              >
                {drawerMode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </div>
          ) : null
        }
      >
        {drawerMode === 'view' && activeIncident ? (
          <div className={styles.detailRow}>
            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Title</p>
              <p className={styles.detailValue}>{activeIncident.title}</p>
            </div>
            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Description</p>
              <p className={styles.detailValue}>{activeIncident.description}</p>
            </div>
            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Location</p>
              <p className={styles.detailValue}>{activeIncident.location}</p>
            </div>
            {(activeIncident.latitude != null || activeIncident.longitude != null) && (
              <div className={styles.detailField}>
                <p className={styles.detailLabel}>Coordinates</p>
                <p className={styles.detailValue}>
                  {activeIncident.latitude}, {activeIncident.longitude}
                </p>
              </div>
            )}
            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Anonymous</p>
              <p className={styles.detailValue}>
                {activeIncident.anonymous ? 'Yes' : 'No'}
              </p>
            </div>
            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Occurred At</p>
              <p className={styles.detailValue}>
                {dayjs(activeIncident.occurredAt).format('DD MMM YYYY HH:mm')}
              </p>
            </div>
            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Reported At</p>
              <p className={styles.detailValue}>
                {dayjs(activeIncident.reportedAt).format('DD MMM YYYY HH:mm')}
              </p>
            </div>
            {activeIncident.hasAudio && (
              <div className={styles.detailField}>
                <p className={styles.detailLabel}>Audio</p>
                <p className={styles.detailValue}>{activeIncident.audioFileName}</p>
              </div>
            )}
            {activeIncident.hasImage && (
              <div className={styles.detailField}>
                <p className={styles.detailLabel}>Image</p>
                <p className={styles.detailValue}>{activeIncident.imageFileName}</p>
              </div>
            )}
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            className={styles.drawerForm}
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <p className={styles.sectionLabel}>Incident Details</p>

            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please provide a title.' }]}
            >
              <Input
                prefix={<FileTextOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Brief title describing the incident"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please describe the incident.' }]}
            >
              <TextArea
                placeholder="Provide as much detail as possible about what occurred..."
                rows={4}
                showCount
                maxLength={4000}
                style={{ resize: 'none' }}
              />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please provide a location.' }]}
            >
              <Input
                prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Address, area, or landmark"
              />
            </Form.Item>

            <div className={styles.coordRow}>
              <Form.Item name="latitude" label="Latitude">
                <InputNumber
                  placeholder="-90 to 90"
                  min={-90}
                  max={90}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber
                  placeholder="-180 to 180"
                  min={-180}
                  max={180}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <div className={styles.divider} />
            <p className={styles.sectionLabel}>Timing</p>

            <div className={styles.dateGrid}>
              <Form.Item
                name="occurredAt"
                label="Occurred At"
                rules={[{ required: true, message: 'Required.' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Select date and time"
                  className={styles.datePickerFull}
                  disabledDate={(d) => d.isAfter(dayjs())}
                />
              </Form.Item>
              <Form.Item
                name="reportedAt"
                label="Reported At"
                rules={[{ required: true, message: 'Required.' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  className={styles.datePickerFull}
                />
              </Form.Item>
            </div>

            <div className={styles.divider} />
            <p className={styles.sectionLabel}>Privacy</p>

            <Form.Item name="anonymous" valuePropName="checked" noStyle>
              <div className={styles.anonymousRow}>
                <div>
                  <p className={styles.anonymousLabel}>Anonymous</p>
                  <p className={styles.anonymousHint}>
                    Identity will not be attached to this incident
                  </p>
                </div>
                <Switch
                  checked={anonymous}
                  onChange={(val) => {
                    setAnonymous(val);
                    form.setFieldValue('anonymous', val);
                  }}
                  style={{ background: anonymous ? '#2563eb' : undefined }}
                />
              </div>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default IncidentsPage;
