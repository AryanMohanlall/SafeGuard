'use client';

import { useState } from 'react';
import { Badge, Button, Tooltip } from 'antd';
import {
  EnvironmentOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useStyles } from './styles/style';

interface Camera {
  id: string;
  name: string;
  location: string;
  youtubeId: string;
}

export const DEMO_CAMERAS: Camera[] = [
  {
    id: '1',
    name: 'Times Square — New York',
    location: 'Manhattan, New York, USA',
    youtubeId: 'fqrmtJanigE', // Times Square New York | LIVE
  },
  {
    id: '2',
    name: 'City Intersection — Tokyo',
    location: 'Shibuya, Tokyo, Japan',
    youtubeId: 'UCWs8rt4ofGmdV4N6KQpP10Q', // SHIBUYA SKY Official Live Feed
  },
  {
    id: '3',
    name: 'Harbour View — Sydney',
    location: 'Sydney, Australia',
    youtubeId: 'hS5-S3Is0I0', // Sydney Live Camera (Opera House/Bridge)
  },
  {
    id: '4',
    name: 'City Centre — London',
    location: 'Westminster, London, UK',
    youtubeId: 'crQbi3kFAXI', // Westminster/Big Ben Live Stream
  },
];

interface YoutubePlayerProps {
  youtubeId: string;
}

function YoutubePlayer({ youtubeId }: YoutubePlayerProps) {
  const { styles } = useStyles();

  return (
    <iframe
      className={styles.video}
      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ border: 'none' }}
    />
  );
}

export default function MonitorPage() {
  const { styles } = useStyles();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expandedCamera = DEMO_CAMERAS.find((c) => c.id === expandedId);

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Live Monitor</h1>
          <p className={styles.pageSubtitle}>Real-time live feeds across monitored zones.</p>
        </div>
        <Badge
          count={`${DEMO_CAMERAS.length} live`}
          style={{ background: '#16a34a', fontSize: 12, fontWeight: 600 }}
        />
      </div>

      {/* Expanded single-camera view */}
      {expandedCamera && (
        <div className={styles.expandedView}>
          <div className={styles.expandedHeader}>
            <div>
              <p className={styles.expandedTitle}>{expandedCamera.name}</p>
              <p className={styles.expandedLocation}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {expandedCamera.location}
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
            <YoutubePlayer key={`expanded-${expandedCamera.id}`} youtubeId={expandedCamera.youtubeId} />
          </div>
        </div>
      )}

      {/* Camera grid */}
      <div className={styles.grid}>
        {DEMO_CAMERAS.map((camera) => {
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

                {/* Expand button */}
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

                <YoutubePlayer key={camera.id} youtubeId={camera.youtubeId} />
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
