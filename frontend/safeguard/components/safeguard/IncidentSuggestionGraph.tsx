'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Button, Descriptions, Drawer, Empty, List, Space, Tag, Tooltip, Typography } from 'antd';
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

const CARD_WIDTH = 192;
const CARD_HEIGHT = 88;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.15;

const TYPE_STYLES: Record<string, CSSProperties> = {
  cluster: { background: '#dbeafe', borderColor: '#60a5fa', color: '#1d4ed8' },
  suggestion: { background: '#dcfce7', borderColor: '#4ade80', color: '#166534' },
  incident: { background: '#fff', borderColor: '#cbd5e1', color: '#0f172a' },
  case: { background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' },
};

const TYPE_LABELS: Record<string, string> = {
  cluster: 'Cluster',
  suggestion: 'Suggestion',
  incident: 'Incident',
  case: 'Case',
};

export function IncidentSuggestionGraph({ nodes, edges }: IncidentSuggestionGraphProps) {
  const { styles } = useStyles();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const hasCenteredRef = useRef(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewportState, setViewportState] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 0,
    clientHeight: 0,
  });

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const groupNodes = useMemo(() => {
    if (!selectedNode?.groupId) {
      return [];
    }

    return nodes.filter((node) => node.groupId === selectedNode.groupId);
  }, [nodes, selectedNode]);

  const relatedIncidents = useMemo(
    () =>
      groupNodes
        .filter((node) => node.type === 'incident')
        .sort((left, right) => {
          if (left.id === selectedNodeId) {
            return -1;
          }
          if (right.id === selectedNodeId) {
            return 1;
          }
          return left.label.localeCompare(right.label);
        }),
    [groupNodes, selectedNodeId],
  );

  const relatedEdges = useMemo(
    () => (selectedNode?.groupId ? edges.filter((edge) => edge.groupId === selectedNode.groupId) : []),
    [edges, selectedNode],
  );

  const connectedEdgeIds = useMemo(
    () =>
      new Set(
        selectedNodeId
          ? edges
              .filter((edge) => edge.source === selectedNodeId || edge.target === selectedNodeId)
              .map((edge) => edge.id)
          : [],
      ),
    [edges, selectedNodeId],
  );

  const connectedNodeIds = useMemo(
    () =>
      new Set(
        selectedNodeId
          ? edges
              .filter((edge) => edge.source === selectedNodeId || edge.target === selectedNodeId)
              .flatMap((edge) => [edge.source, edge.target])
          : [],
      ),
    [edges, selectedNodeId],
  );

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

      const baseX = 220 + groupIndex * 520;
      if (clusterNode) {
        positions.set(clusterNode.id, { x: baseX, y: 110 });
      }

      if (suggestionNode) {
        positions.set(suggestionNode.id, { x: baseX, y: 270 });
      }

      caseNodes.forEach((node, index) => {
        positions.set(node.id, {
          x: baseX + (index - (caseNodes.length - 1) / 2) * 220,
          y: 430,
        });
      });

      incidentNodes.forEach((node, index) => {
        positions.set(node.id, {
          x: baseX + (index % 3 === 0 ? -180 : index % 3 === 1 ? 0 : 180),
          y: 620 + Math.floor(index / 3) * 170,
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
      { x: 520, y: 520 },
    );

    return {
      positions,
      width: maxPoint.x + 320,
      height: maxPoint.y + 240,
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
    const initialTop = Math.max((canvasHeight - viewport.clientHeight) / 4, 0);
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

  useEffect(() => {
    if (!selectedNodeId) {
      return;
    }

    const viewport = viewportRef.current;
    const point = layout.positions.get(selectedNodeId);
    if (!viewport || !point) {
      return;
    }

    const nextLeft = Math.max(
      Math.min(point.x * scale - viewport.clientWidth / 2, canvasWidth - viewport.clientWidth),
      0,
    );
    const nextTop = Math.max(
      Math.min(point.y * scale - viewport.clientHeight / 2, canvasHeight - viewport.clientHeight),
      0,
    );

    viewport.scrollTo({
      left: nextLeft,
      top: nextTop,
      behavior: 'smooth',
    });
  }, [canvasHeight, canvasWidth, layout.positions, scale, selectedNodeId]);

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
    if (target?.closest('button') || target?.closest('[data-graph-node="true"]')) {
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
    <>
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
          <Typography.Text type="secondary">Drag to pan, click a node for details, use Ctrl/Cmd + wheel to zoom.</Typography.Text>
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
                  const isConnected = connectedEdgeIds.has(edge.id);
                  const isDimmed = selectedNodeId !== null && !isConnected;

                  return (
                    <line
                      key={edge.id}
                      x1={source.x}
                      y1={source.y + CARD_HEIGHT / 2}
                      x2={target.x}
                      y2={target.y - CARD_HEIGHT / 2}
                      stroke={stroke}
                      strokeWidth={isConnected ? 4 : edge.type === 'cluster-suggestion' ? 3 : 2}
                      strokeDasharray={edge.type === 'suggestion-incident' ? '6 6' : undefined}
                      opacity={isDimmed ? 0.18 : isConnected ? 1 : 0.85}
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
                const isSelected = node.id === selectedNodeId;
                const isConnected = connectedNodeIds.has(node.id);
                const isDimmed = selectedNodeId !== null && !isSelected && !isConnected;

                return (
                  <button
                    key={node.id}
                    type="button"
                    data-graph-node="true"
                    className={`${styles.nodeCard} ${isSelected ? styles.nodeCardSelected : ''} ${
                      isConnected ? styles.nodeCardConnected : ''
                    } ${isDimmed ? styles.nodeCardDimmed : ''}`}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      left: point.x - CARD_WIDTH / 2,
                      top: point.y - CARD_HEIGHT / 2,
                      width: CARD_WIDTH,
                      minHeight: CARD_HEIGHT,
                      ...typeStyle,
                    }}
                  >
                    <div className={styles.nodeType}>{TYPE_LABELS[node.type] ?? node.type}</div>
                    <div className={styles.nodeLabel}>{node.label}</div>
                    {node.subtitle && <div className={styles.nodeSubtitle}>{node.subtitle}</div>}
                  </button>
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

      <Drawer
        title={selectedNode ? `${TYPE_LABELS[selectedNode.type] ?? selectedNode.type} Details` : 'Node Details'}
        placement="right"
        size={420}
        open={Boolean(selectedNode)}
        onClose={() => setSelectedNodeId(null)}
      >
        {selectedNode ? (
          <Space direction="vertical" size="large" className={styles.detailsStack}>
            <div>
              <Typography.Title level={4} className={styles.detailsTitle}>
                {selectedNode.label}
              </Typography.Title>
              {selectedNode.subtitle && (
                <Typography.Paragraph type="secondary" className={styles.detailsSubtitle}>
                  {selectedNode.subtitle}
                </Typography.Paragraph>
              )}
              <Space wrap size={[8, 8]}>
                <Tag color="blue">{TYPE_LABELS[selectedNode.type] ?? selectedNode.type}</Tag>
                {selectedNode.status && <Tag>{selectedNode.status}</Tag>}
                {selectedNode.clusterId !== undefined && selectedNode.clusterId !== null && (
                  <Tag color="geekblue">Cluster {selectedNode.clusterId}</Tag>
                )}
                {selectedNode.confidenceScore !== undefined && selectedNode.confidenceScore !== null && (
                  <Tag color="green">Confidence {Math.round(selectedNode.confidenceScore * 100)}%</Tag>
                )}
              </Space>
            </div>

            <Descriptions column={1} size="small" className={styles.detailsMeta}>
              {selectedNode.incidentId && <Descriptions.Item label="Incident ID">{selectedNode.incidentId}</Descriptions.Item>}
              {selectedNode.caseId && <Descriptions.Item label="Case ID">{selectedNode.caseId}</Descriptions.Item>}
              {selectedNode.latitude !== undefined && selectedNode.latitude !== null && (
                <Descriptions.Item label="Latitude">{selectedNode.latitude}</Descriptions.Item>
              )}
              {selectedNode.longitude !== undefined && selectedNode.longitude !== null && (
                <Descriptions.Item label="Longitude">{selectedNode.longitude}</Descriptions.Item>
              )}
              {selectedNode.groupId && <Descriptions.Item label="Graph group">{selectedNode.groupId}</Descriptions.Item>}
            </Descriptions>

            <div>
              <Typography.Text strong>Cluster summary</Typography.Text>
              <div className={styles.summaryTags}>
                <Tag>{groupNodes.filter((node) => node.type === 'incident').length} incidents</Tag>
                <Tag color="cyan">{groupNodes.filter((node) => node.type === 'case').length} cases</Tag>
                <Tag color="green">{groupNodes.filter((node) => node.type === 'suggestion').length} suggestions</Tag>
                <Tag color="purple">{relatedEdges.length} links</Tag>
              </div>
            </div>

            <div>
              <Typography.Text strong>Incidents in this group</Typography.Text>
              {relatedIncidents.length > 0 ? (
                <List
                  className={styles.incidentList}
                  dataSource={relatedIncidents}
                  renderItem={(incidentNode) => (
                    <List.Item
                      className={`${styles.incidentListItem} ${incidentNode.id === selectedNodeId ? styles.incidentListItemActive : ''}`}
                      onClick={() => setSelectedNodeId(incidentNode.id)}
                    >
                      <div>
                        <div className={styles.incidentListTitle}>{incidentNode.label}</div>
                        {incidentNode.subtitle && (
                          <div className={styles.incidentListSubtitle}>{incidentNode.subtitle}</div>
                        )}
                      </div>
                      <Space wrap size={[6, 6]}>
                        {incidentNode.status && <Tag>{incidentNode.status}</Tag>}
                        {incidentNode.caseId && <Tag color="gold">Linked case</Tag>}
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No incidents linked to this node group." />
              )}
            </div>
          </Space>
        ) : null}
      </Drawer>
    </>
  );
}
