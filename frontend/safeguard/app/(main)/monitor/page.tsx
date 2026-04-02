'use client';

import Hls from 'hls.js';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Skeleton, Tooltip } from 'antd';
import {
  EnvironmentOutlined,
  ExpandAltOutlined,
  GlobalOutlined,
  LinkOutlined,
  ShrinkOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
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
  const apiBase = getAxiosInstance().defaults.baseURL?.replace(/\/$/, '') ?? '';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStreams = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await getAxiosInstance().get('/api/monitor/streams', {
          headers: { 'Cache-Control': 'no-store' },
        });
        const nextCameras = readCameraList(response.data);

        if (!isMounted) {
          return;
        }

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

    void loadStreams();

    return () => {
      isMounted = false;
    };
  }, []);

  const expandedCamera = expandedId ? cameras.find((camera) => camera.id === expandedId) ?? null : null;

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
          : cameras.map((camera) => {
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
