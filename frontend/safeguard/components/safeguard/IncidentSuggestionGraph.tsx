'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { IIncidentGraphEdge, IIncidentGraphNode } from '@/providers/incident-clustering-provider/context';

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

const TYPE_STYLES: Record<string, CSSProperties> = {
  cluster: { background: '#dbeafe', borderColor: '#60a5fa', color: '#1d4ed8' },
  suggestion: { background: '#dcfce7', borderColor: '#4ade80', color: '#166534' },
  incident: { background: '#fff', borderColor: '#cbd5e1', color: '#0f172a' },
  case: { background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' },
};

export function IncidentSuggestionGraph({ nodes, edges }: IncidentSuggestionGraphProps) {
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

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        background:
          'radial-gradient(circle at top left, rgba(191,219,254,0.4), transparent 35%), #f8fafc',
      }}
    >
      <svg width={layout.width} height={layout.height} style={{ display: 'block' }}>
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

        const style = TYPE_STYLES[node.type] ?? TYPE_STYLES.incident;

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: point.x - CARD_WIDTH / 2,
              top: point.y - CARD_HEIGHT / 2,
              width: CARD_WIDTH,
              minHeight: CARD_HEIGHT,
              padding: '12px 14px',
              borderRadius: 16,
              border: '2px solid',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              ...style,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.72 }}>
              {node.type}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, marginTop: 6 }}>
              {node.label}
            </div>
            {node.subtitle && (
              <div style={{ fontSize: 12, lineHeight: 1.35, marginTop: 6, opacity: 0.8 }}>
                {node.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
