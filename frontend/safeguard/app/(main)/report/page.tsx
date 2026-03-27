'use client';

import { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Input, Switch, message } from 'antd';
import { EnvironmentOutlined, FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStyles } from './styles/style';
import { useIncidentAction } from '@/providers/incidents-provider';

const { TextArea } = Input;

interface IncidentFormValues {
  title: string;
  description: string;
  location: string;
  anonymous: boolean;
  occurredAt: dayjs.Dayjs;
  reportedAt: dayjs.Dayjs;
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied';

const IncidentPage = () => {
  const { styles } = useStyles();
  const { create } = useIncidentAction();
  const [form] = Form.useForm<IncidentFormValues>();
  const [anonymous, setAnonymous] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => {
        setGeoStatus('denied');
      }
    );
  }, []);

  const handleReset = () => {
    form.resetFields();
    setAnonymous(false);
  };

  const handleSubmit = (values: IncidentFormValues) => {
    create({
      title: values.title,
      description: values.description,
      location: values.location,
      anonymous: values.anonymous ?? false,
      occurredAt: values.occurredAt.toISOString(),
      reportedAt: values.reportedAt.toISOString(),
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });

    message.success('Incident submitted successfully.');
    handleReset();
  };

  const locationSuffix =
    geoStatus === 'requesting' ? (
      <LoadingOutlined style={{ color: '#94a3b8' }} />
    ) : geoStatus === 'granted' ? (
      <EnvironmentOutlined style={{ color: '#2563eb' }} title="Location attached" />
    ) : null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Report an Incident</h1>
        <p className={styles.pageSubtitle}>
          Submit a report about a crime or suspicious activity. All information is treated with strict confidentiality.
        </p>
      </div>

      <div className={styles.card}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            anonymous: false,
            reportedAt: dayjs(),
          }}
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* Basic Info */}
          <p className={styles.sectionLabel}>Incident Details</p>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please provide a title.' }]}
          >
            <Input
              prefix={<FileTextOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Brief title describing the incident"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please describe the incident.' }]}
          >
            <TextArea
              placeholder="Provide as much detail as possible about what occurred..."
              rows={5}
              showCount
              maxLength={2000}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please provide a location.' }]}
            extra={
              geoStatus === 'granted'
                ? 'Your GPS coordinates will be attached to this report.'
                : geoStatus === 'denied'
                ? 'Location access denied — coordinates will not be attached.'
                : undefined
            }
          >
            <Input
              prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
              suffix={locationSuffix}
              placeholder="Address, area, or landmark"
              size="large"
            />
          </Form.Item>

          <div className={styles.divider} />

          {/* Timing */}
          <p className={styles.sectionLabel}>Timing</p>

          <div className={styles.dateGrid}>
            <Form.Item
              name="occurredAt"
              label="Date & Time Occurred"
              rules={[{ required: true, message: 'Please select when the incident occurred.' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="Select date and time"
                className={styles.datePickerFull}
                size="large"
                disabledDate={(d) => d.isAfter(dayjs())}
              />
            </Form.Item>

            <Form.Item
              name="reportedAt"
              label="Date & Time Reported"
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className={styles.datePickerFull}
                size="large"
                disabled
              />
            </Form.Item>
          </div>

          <div className={styles.divider} />

          {/* Anonymous */}
          <p className={styles.sectionLabel}>Privacy</p>

          <Form.Item name="anonymous" valuePropName="checked" noStyle>
            <div className={styles.anonymousRow}>
              <div>
                <p className={styles.anonymousLabel}>Submit anonymously</p>
                <p className={styles.anonymousHint}>
                  Your identity will not be attached to this incident
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

          {/* Actions */}
          <div className={styles.submitRow}>
            <Button size="large" onClick={handleReset}>
              Clear
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              style={{ background: '#2563eb', borderColor: '#2563eb', minWidth: 140 }}
            >
              Submit Incident
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default IncidentPage;
