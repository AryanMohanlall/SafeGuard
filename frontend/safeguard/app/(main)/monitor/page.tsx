'use client';

import Hls from 'hls.js';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Empty, Form, Input, InputNumber, Popconfirm, Select, Skeleton, Space, Switch, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EnvironmentOutlined,
  ExpandAltOutlined,
  GlobalOutlined,
  LinkOutlined,
  PlusOutlined,
  ShrinkOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useLiveStreamAction, useLiveStreamState } from '@/providers/live-streams-provider';
import { getAxiosInstance } from '@/utils/axiosInstance';
import { useStyles } from './styles/style';

interface Camera {
  id: string;
  name: string;
  location: string;
  sourceName: string;
  sourceUrl: string;
  streamUrl: string;
  thumbnailUrl: string;
}

interface StreamPreset {
  key: string;
  name: string;
  location: string;
  sourceName: string;
  sourceUrl: string;
  camKey: string;
  thumbnailUrl?: string;
  region: 'South Africa' | 'Global';
}

const STREAM_PRESETS: StreamPreset[] = [
  {
    key: 'za-cape-town',
    name: 'Cape Town Cam',
    location: 'Cape Town, South Africa',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/world/southafrica/capetown/?cam=capetown',
    camKey: 'capetown',
    region: 'South Africa',
  },
  {
    key: 'ie-temple-bar',
    name: 'Temple Bar',
    location: 'Dublin, Ireland',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/world/ireland/dublin/?cam=templebar',
    camKey: 'templebar',
    region: 'Global',
  },
  {
    key: 'uk-abbey-road',
    name: 'Abbey Road Crossing',
    location: 'London, England, UK',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk',
    camKey: 'abbeyroad_uk',
    region: 'Global',
  },
  {
    key: 'us-bourbon-street',
    name: 'Bourbon Street',
    location: 'New Orleans, Louisiana, USA',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/usa/louisiana/neworleans/bourbonstreet/?cam=bourbonstreet',
    camKey: 'bourbonstreet',
    region: 'Global',
  },
  {
    key: 'us-mulberry-street',
    name: 'Mulberry Street',
    location: 'Manhattan, New York, USA',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly',
    camKey: 'littleitaly',
    region: 'Global',
  },
];

function readCameraList(payload: unknown): Camera[] {
  if (Array.isArray(payload)) {
    return payload as Camera[];
  }

  if (typeof payload !== 'object' || payload === null) {
    return [];
  }

  if ('cameras' in payload && Array.isArray(payload.cameras)) {
    return payload.cameras as Camera[];
  }

  if (
    'result' in payload &&
    typeof payload.result === 'object' &&
    payload.result !== null &&
    'cameras' in payload.result &&
    Array.isArray(payload.result.cameras)
  ) {
    return payload.result.cameras as Camera[];
  }

  return [];
}

interface StreamPlayerProps {
  camera: Camera;
}

function StreamPlayer({ camera }: StreamPlayerProps) {
  const { styles } = useStyles();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const canUseNativeHls =
    typeof document !== 'undefined' &&
    document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== '';
  const supportsPlayback = canUseNativeHls || Hls.isSupported();

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.playsInline = true;

    if (canUseNativeHls) {
      video.src = camera.streamUrl;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    if (!supportsPlayback) {
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(camera.streamUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        setHasError(true);
        hls.destroy();
      }
    });

    return () => {
      hls.destroy();
    };
  }, [camera.streamUrl, canUseNativeHls, supportsPlayback]);

  return (
    <>
      <video
        ref={videoRef}
        className={styles.video}
        poster={camera.thumbnailUrl}
        autoPlay
        muted
        playsInline
        controls
      />
      {(hasError || !supportsPlayback) && (
        <div className={styles.errorOverlay}>
          <span>
            {supportsPlayback ? 'Live stream unavailable right now.' : 'This browser cannot play this live stream.'}
          </span>
          <Link href={camera.sourceUrl} target="_blank" rel="noreferrer" className={styles.inlineLink}>
            Open on {camera.sourceName}
          </Link>
        </div>
      )}
    </>
  );
}

function CameraSkeleton() {
  const { styles } = useStyles();

  return (
    <div className={styles.feedCard}>
      <div className={styles.videoWrapper}>
        <Skeleton.Image active style={{ width: '100%', height: '100%' }} />
      </div>
      <div className={styles.cardFooter}>
        <div style={{ width: '100%' }}>
          <Skeleton active title={{ width: '70%' }} paragraph={{ rows: 1, width: ['50%'] }} />
        </div>
      </div>
    </div>
  );
}

export default function MonitorPage() {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const apiBase = getAxiosInstance().defaults.baseURL?.replace(/\/$/, '') ?? '';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [manageError, setManageError] = useState<string | null>(null);
  const { items: liveStreams, isPending: isMutatingStreams } = useLiveStreamState();
  const { fetchAll, create, remove } = useLiveStreamAction();

  const loadStreams = async () => {
    setIsLoading(true);
    setLoadError(null);

    const response = await getAxiosInstance().get('/api/monitor/streams', {
      headers: { 'Cache-Control': 'no-store' },
    });
    const nextCameras = readCameraList(response.data);

    if (nextCameras.length === 0) {
      throw new Error('No camera feeds were returned by the API.');
    }

    setCameras(
      nextCameras.map((camera) => ({
        ...camera,
        streamUrl: camera.streamUrl.startsWith('http') || !apiBase
          ? camera.streamUrl
          : `${apiBase}${camera.streamUrl}`,
      })),
    );
    setExpandedId((current) => current ?? nextCameras[0]?.id ?? null);
  };

  useEffect(() => {
    void fetchAll({ skipCount: 0, maxResultCount: 100 }).catch(() => {
      setManageError('Unable to fetch live streams.');
    });
    // The provider action identity changes with context renders; we only need the initial load here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrateStreams = async () => {
      try {
        if (!isMounted) {
          return;
        }

        await loadStreams();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'data' in error.response &&
          typeof error.response.data === 'object' &&
          error.response.data !== null &&
          'message' in error.response.data &&
          typeof error.response.data.message === 'string'
            ? error.response.data.message
            : error instanceof Error
              ? error.message
              : 'Unable to load camera feeds.';

        setLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void hydrateStreams();

    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  const expandedCamera = expandedId ? cameras.find((camera) => camera.id === expandedId) ?? null : null;
  const gridCameras = expandedId
    ? cameras.filter((camera) => camera.id !== expandedId)
    : cameras;

  const handleCreateStream = async (values: {
    name: string;
    location: string;
    sourceName: string;
    sourceUrl: string;
    camKey: string;
    thumbnailUrl?: string;
    isActive: boolean;
    sortOrder: number;
  }) => {
    try {
      setManageError(null);
      await create({
        ...values,
        thumbnailUrl: values.thumbnailUrl?.trim() || null,
      });
      form.resetFields();
      form.setFieldsValue({ sourceName: 'EarthCam', isActive: true, sortOrder: liveStreams.length + 1 });
      await fetchAll({ skipCount: 0, maxResultCount: 100 });
      await loadStreams();
    } catch (error) {
      setManageError(error instanceof Error ? error.message : 'Unable to save the live stream.');
    }
  };

  const handleDeleteStream = async (id: string) => {
    try {
      setManageError(null);
      await remove(id);
      await fetchAll({ skipCount: 0, maxResultCount: 100 });
      await loadStreams();
    } catch (error) {
      setManageError(error instanceof Error ? error.message : 'Unable to delete the live stream.');
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = STREAM_PRESETS.find((item) => item.key === presetKey);

    if (!preset) {
      return;
    }

    form.setFieldsValue({
      name: preset.name,
      location: preset.location,
      sourceName: preset.sourceName,
      sourceUrl: preset.sourceUrl,
      camKey: preset.camKey,
      thumbnailUrl: preset.thumbnailUrl ?? '',
      isActive: true,
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Live Monitor</h1>
          <p className={styles.pageSubtitle}>
            Real public street cameras and city feeds sourced from live webcam providers.
          </p>
        </div>
        <Badge
          count={`${cameras.length || 0} live`}
          style={{ background: '#16a34a', fontSize: 12, fontWeight: 600 }}
        />
      </div>

      <Card
        title="Manage Live Streams"
        className={styles.managementCard}
        extra={<Tag color="blue">{liveStreams.length} configured</Tag>}
      >
        <Space orientation="vertical" size="large" className={styles.managementStack}>
          {manageError && (
            <Alert
              type="error"
              showIcon
              title="Live stream update failed."
              description={manageError}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            className={styles.managementForm}
            initialValues={{ sourceName: 'EarthCam', isActive: true, sortOrder: liveStreams.length + 1 }}
            onFinish={handleCreateStream}
          >
            <div className={styles.formGrid}>
              <Form.Item name="preset" label="EarthCam preset" className={styles.formItemWide}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Choose a preset to auto-fill the form"
                  optionFilterProp="label"
                  onChange={(value) => {
                    if (typeof value === 'string') {
                      handlePresetSelect(value);
                    }
                  }}
                  options={[
                    {
                      label: 'South Africa',
                      options: STREAM_PRESETS.filter((preset) => preset.region === 'South Africa').map((preset) => ({
                        value: preset.key,
                        label: `${preset.name} - ${preset.location}`,
                      })),
                    },
                    {
                      label: 'Global fallback',
                      options: STREAM_PRESETS.filter((preset) => preset.region === 'Global').map((preset) => ({
                        value: preset.key,
                        label: `${preset.name} - ${preset.location}`,
                      })),
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a stream name.' }]}>
                <Input placeholder="Temple Bar" />
              </Form.Item>

              <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Enter a location.' }]}>
                <Input placeholder="Dublin, Ireland" />
              </Form.Item>

              <Form.Item name="sourceName" label="Source" rules={[{ required: true, message: 'Enter a source.' }]}>
                <Input placeholder="EarthCam" />
              </Form.Item>

              <Form.Item name="camKey" label="Camera key" rules={[{ required: true, message: 'Enter a camera key.' }]}>
                <Input placeholder="templebar" />
              </Form.Item>

              <Form.Item name="sourceUrl" label="Source URL" className={styles.formItemWide} rules={[{ required: true, message: 'Enter the source URL.' }]}>
                <Input placeholder="https://www.earthcam.com/world/ireland/dublin/?cam=templebar" />
              </Form.Item>

              <Form.Item name="thumbnailUrl" label="Thumbnail URL" className={styles.formItemWide}>
                <Input placeholder="Optional fallback thumbnail URL" />
              </Form.Item>

              <Form.Item name="sortOrder" label="Sort order" rules={[{ required: true, message: 'Enter the sort order.' }]}>
                <InputNumber min={0} max={1000} className={styles.numberInput} />
              </Form.Item>

              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>

            <p className={styles.formHint}>
              Presets are curated EarthCam shortcuts, with South Africa listed first. You can still edit any field manually.
            </p>

            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={isMutatingStreams}>
              Add Stream
            </Button>
          </Form>

          {liveStreams.length === 0 ? (
            <Empty description="No live streams configured yet." />
          ) : (
            <div className={styles.streamList}>
              {liveStreams.map(stream => (
                <div key={stream.id} className={styles.streamListItem}>
                  <div className={styles.streamMeta}>
                    <p className={styles.streamName}>{stream.name}</p>
                    <p className={styles.streamInfo}>
                      {stream.location} - {stream.sourceName} - {stream.camKey}
                    </p>
                  </div>
                  <Space size="small" wrap>
                    <Tag color={stream.isActive ? 'green' : 'default'}>
                      {stream.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                    <Tag>#{stream.sortOrder}</Tag>
                    <Popconfirm
                      title="Delete this live stream?"
                      description="This removes the configured stream from the monitor."
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDeleteStream(stream.id)}
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              ))}
            </div>
          )}
        </Space>
      </Card>

      {loadError && (
        <Alert
          type="error"
          showIcon
          title="Camera feeds could not be loaded."
          description={loadError}
          style={{ marginBottom: 20 }}
        />
      )}

      {!isLoading && expandedCamera && (
        <div className={styles.expandedView}>
          <div className={styles.expandedHeader}>
            <div>
              <p className={styles.expandedTitle}>{expandedCamera.name}</p>
              <p className={styles.expandedLocation}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {expandedCamera.location}
              </p>
              <p className={styles.expandedMeta}>
                <GlobalOutlined style={{ marginRight: 4 }} />
                Source: {expandedCamera.sourceName}
                <Link
                  href={expandedCamera.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.inlineLink}
                >
                  <LinkOutlined style={{ marginRight: 4 }} />
                  Open source feed
                </Link>
              </p>
            </div>
            <Tooltip title="Close expanded view">
              <Button
                type="text"
                icon={<ShrinkOutlined />}
                style={{ color: '#94a3b8' }}
                onClick={() => setExpandedId(null)}
              />
            </Tooltip>
          </div>
          <div className={styles.videoWrapper} style={{ aspectRatio: '16/9', maxHeight: 520 }}>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Live
            </div>
            <StreamPlayer
              key={`expanded-${expandedCamera.id}-${expandedCamera.streamUrl}`}
              camera={expandedCamera}
            />
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => <CameraSkeleton key={index} />)
          : gridCameras.map((camera) => {
              const isExpanded = camera.id === expandedId;

              return (
                <div
                  key={camera.id}
                  className={`${styles.feedCard} ${isExpanded ? styles.feedCardActive : ''}`}
                >
                  <div className={styles.videoWrapper}>
                    <div className={styles.liveBadge}>
                      <span className={styles.liveDot} />
                      Live
                    </div>

                    <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                      <Button
                        type="text"
                        size="small"
                        icon={isExpanded ? <ShrinkOutlined /> : <ExpandAltOutlined />}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 10,
                          color: '#fff',
                          background: 'rgba(0,0,0,0.5)',
                          border: 'none',
                        }}
                        onClick={() => setExpandedId(isExpanded ? null : camera.id)}
                      />
                    </Tooltip>

                    <StreamPlayer key={`${camera.id}-${camera.streamUrl}`} camera={camera} />
                  </div>

                  <div className={styles.cardFooter}>
                    <div style={{ minWidth: 0 }}>
                      <p className={styles.cameraName}>
                        <VideoCameraOutlined style={{ marginRight: 6, color: '#475569' }} />
                        {camera.name}
                      </p>
                      <p className={styles.cameraLocation}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {camera.location}
                      </p>
                      <p className={styles.cameraSource}>
                        <GlobalOutlined style={{ marginRight: 4 }} />
                        {camera.sourceName}
                      </p>
                    </div>
                    <Badge
                      status="success"
                      text={<span style={{ fontSize: 11, color: '#94a3b8' }}>Live</span>}
                    />
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
