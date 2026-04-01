'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Button, Space, Tooltip, Typography } from 'antd';
import { MinusOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { IIncidentGraphEdge, IIncidentGraphNode } from '@/providers/incident-clustering-provider/context';
import { useStyles } from './styles/style';

interface IncidentSuggestionGraphProps {
  nodes: IIncidentGraphNode[];
  edges: IIncidentGraphEdge[];
}

interface NodePosition {
  x: number;
  y: number;
}

const CARD_WIDTH = 156;
const CARD_HEIGHT = 72;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.15;

const TYPE_STYLES: Record<string, CSSProperties> = {
  cluster: { background: '#dbeafe', borderColor: '#60a5fa', color: '#1d4ed8' },
  suggestion: { background: '#dcfce7', borderColor: '#4ade80', color: '#166534' },
  incident: { background: '#fff', borderColor: '#cbd5e1', color: '#0f172a' },
  case: { background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' },
};

export function IncidentSuggestionGraph({ nodes, edges }: IncidentSuggestionGraphProps) {
  const { styles } = useStyles();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const hasCenteredRef = useRef(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportState, setViewportState] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 0,
    clientHeight: 0,
  });

  const layout = useMemo(() => {
    const positions = new Map<string, NodePosition>();
    const groupedNodes = Array.from(
      nodes.reduce((map, node) => {
        const key = node.groupId || 'ungrouped';
        const current = map.get(key) ?? [];
        current.push(node);
        map.set(key, current);
        return map;
      }, new Map<string, IIncidentGraphNode[]>()),
    );

    groupedNodes.forEach(([groupId, groupNodes], groupIndex) => {
      const clusterNode = groupNodes.find((node) => node.type === 'cluster');
      const suggestionNode = groupNodes.find((node) => node.type === 'suggestion');
      const caseNodes = groupNodes.filter((node) => node.type === 'case');
      const incidentNodes = groupNodes.filter((node) => node.type === 'incident');

      const baseX = 180 + groupIndex * 360;
      if (clusterNode) {
        positions.set(clusterNode.id, { x: baseX, y: 90 });
      }

      if (suggestionNode) {
        positions.set(suggestionNode.id, { x: baseX, y: 210 });
      }

      caseNodes.forEach((node, index) => {
        positions.set(node.id, {
          x: baseX + (index - (caseNodes.length - 1) / 2) * 180,
          y: 330,
        });
      });

      incidentNodes.forEach((node, index) => {
        positions.set(node.id, {
          x: baseX + ((index % 2) === 0 ? -95 : 95),
          y: 450 + Math.floor(index / 2) * 130,
        });
      });

      if (!clusterNode && !suggestionNode && caseNodes.length === 0) {
        positions.set(groupId, { x: baseX, y: 120 });
      }
    });

    const maxPoint = Array.from(positions.values()).reduce(
      (acc, point) => ({
        x: Math.max(acc.x, point.x),
        y: Math.max(acc.y, point.y),
      }),
      { x: 420, y: 420 },
    );

    return {
      positions,
      width: maxPoint.x + 220,
      height: maxPoint.y + 160,
    };
  }, [nodes]);

  const canvasWidth = Math.max(layout.width * scale, layout.width);
  const canvasHeight = Math.max(layout.height * scale, layout.height);
  const minimapScale = Math.min(170 / canvasWidth, 120 / canvasHeight);
  const minimapWidth = canvasWidth * minimapScale;
  const minimapHeight = canvasHeight * minimapScale;

  const syncViewportState = () => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    setViewportState({
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      clientWidth: viewport.clientWidth,
      clientHeight: viewport.clientHeight,
    });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || hasCenteredRef.current) {
      return;
    }

    const initialLeft = Math.max((canvasWidth - viewport.clientWidth) / 2, 0);
    const initialTop = Math.max((canvasHeight - viewport.clientHeight) / 2.8, 0);
    viewport.scrollTo({ left: initialLeft, top: initialTop });
    hasCenteredRef.current = true;
    syncViewportState();
  }, [canvasHeight, canvasWidth]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    syncViewportState();

    const handleScroll = () => syncViewportState();
    viewport.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => syncViewportState());
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [canvasHeight, canvasWidth]);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));

  const updateScale = (nextScale: number) => {
    const viewport = viewportRef.current;
    const boundedScale = clampScale(nextScale);
    if (!viewport || boundedScale === scale) {
      setScale(boundedScale);
      return;
    }

    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    const ratio = boundedScale / scale;

    setScale(boundedScale);

    requestAnimationFrame(() => {
      viewport.scrollTo({
        left: Math.max(centerX * ratio - viewport.clientWidth / 2, 0),
        top: Math.max(centerY * ratio - viewport.clientHeight / 2, 0),
      });
      syncViewportState();
    });
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    updateScale(scale + direction * SCALE_STEP);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    setIsDragging(true);
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;
    if (!viewport || !dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    viewport.scrollTo({
      left: dragState.left - (event.clientX - dragState.x),
      top: dragState.top - (event.clientY - dragState.y),
    });
  };

  const finishDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (viewport && dragStateRef.current?.pointerId === event.pointerId) {
      viewport.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setIsDragging(false);
  };

  const handleMinimapPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const viewport = viewportRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!viewport || rect.width === 0 || rect.height === 0) {
      return;
    }

    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;

    viewport.scrollTo({
      left: Math.max(relativeX * canvasWidth - viewport.clientWidth / 2, 0),
      top: Math.max(relativeY * canvasHeight - viewport.clientHeight / 2, 0),
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.graphContainer}>
      <div className={styles.graphToolbar}>
        <Space size="small">
          <Tooltip title="Zoom out">
            <Button icon={<MinusOutlined />} onClick={() => updateScale(scale - SCALE_STEP)} />
          </Tooltip>
          <Button className={styles.zoomLabel} onClick={() => updateScale(1)}>
            {Math.round(scale * 100)}%
          </Button>
          <Tooltip title="Zoom in">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => updateScale(scale + SCALE_STEP)} />
          </Tooltip>
          <Tooltip title="Reset view">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                hasCenteredRef.current = false;
                updateScale(1);
              }}
            />
          </Tooltip>
        </Space>
        <Typography.Text type="secondary">Drag to pan. Use Ctrl/Cmd + wheel to zoom.</Typography.Text>
      </div>

      <div
        ref={viewportRef}
        className={`${styles.graphViewport} ${isDragging ? styles.graphViewportDragging : ''}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        onPointerLeave={finishDragging}
      >
        <div className={styles.graphCanvas} style={{ width: canvasWidth, height: canvasHeight }}>
          <div
            style={{
              position: 'relative',
              width: layout.width,
              height: layout.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <svg width={layout.width} height={layout.height} className={styles.graphSvg}>
          {edges.map((edge) => {
            const source = layout.positions.get(edge.source);
            const target = layout.positions.get(edge.target);
            if (!source || !target) {
              return null;
            }

            const stroke =
              edge.type === 'cluster-suggestion'
                ? '#16a34a'
                : edge.type === 'case-incident'
                ? '#f59e0b'
                : '#94a3b8';

            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y + CARD_HEIGHT / 2}
                x2={target.x}
                y2={target.y - CARD_HEIGHT / 2}
                stroke={stroke}
                strokeWidth={edge.type === 'cluster-suggestion' ? 3 : 2}
                strokeDasharray={edge.type === 'suggestion-incident' ? '6 6' : undefined}
                opacity={0.85}
              />
            );
          })}
            </svg>

            {nodes.map((node) => {
              const point = layout.positions.get(node.id);
              if (!point) {
                return null;
              }

              const typeStyle = TYPE_STYLES[node.type] ?? TYPE_STYLES.incident;

              return (
                <div
                  key={node.id}
                  className={styles.nodeCard}
                  style={{
                    left: point.x - CARD_WIDTH / 2,
                    top: point.y - CARD_HEIGHT / 2,
                    width: CARD_WIDTH,
                    minHeight: CARD_HEIGHT,
                    ...typeStyle,
                  }}
                >
                  <div className={styles.nodeType}>{node.type}</div>
                  <div className={styles.nodeLabel}>{node.label}</div>
                  {node.subtitle && <div className={styles.nodeSubtitle}>{node.subtitle}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.minimapShell}>
          <div className={styles.minimapHeader}>Map</div>
          <div
            className={styles.minimap}
            style={{ width: minimapWidth, height: minimapHeight }}
            onPointerDown={handleMinimapPointerDown}
          >
            <svg width={minimapWidth} height={minimapHeight} className={styles.minimapSvg}>
              {edges.map((edge) => {
                const source = layout.positions.get(edge.source);
                const target = layout.positions.get(edge.target);
                if (!source || !target) {
                  return null;
                }

                return (
                  <line
                    key={`mini-${edge.id}`}
                    x1={source.x * scale * minimapScale}
                    y1={(source.y + CARD_HEIGHT / 2) * scale * minimapScale}
                    x2={target.x * scale * minimapScale}
                    y2={(target.y - CARD_HEIGHT / 2) * scale * minimapScale}
                    stroke="rgba(100, 116, 139, 0.45)"
                    strokeWidth={1}
                  />
                );
              })}
              {nodes.map((node) => {
                const point = layout.positions.get(node.id);
                if (!point) {
                  return null;
                }

                const fill =
                  node.type === 'cluster'
                    ? '#2563eb'
                    : node.type === 'suggestion'
                    ? '#16a34a'
                    : node.type === 'case'
                    ? '#d97706'
                    : '#475569';

                return (
                  <rect
                    key={`mini-node-${node.id}`}
                    x={(point.x - CARD_WIDTH / 2) * scale * minimapScale}
                    y={(point.y - CARD_HEIGHT / 2) * scale * minimapScale}
                    width={Math.max(CARD_WIDTH * scale * minimapScale, 4)}
                    height={Math.max(CARD_HEIGHT * scale * minimapScale, 4)}
                    rx={3}
                    fill={fill}
                    opacity={0.82}
                  />
                );
              })}
              <rect
                x={viewportState.scrollLeft * minimapScale}
                y={viewportState.scrollTop * minimapScale}
                width={Math.min(viewportState.clientWidth, canvasWidth) * minimapScale}
                height={Math.min(viewportState.clientHeight, canvasHeight) * minimapScale}
                className={styles.minimapViewport}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
