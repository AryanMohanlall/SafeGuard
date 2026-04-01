import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => ({
  graphContainer: css`
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background:
      radial-gradient(circle at top left, rgba(191, 219, 254, 0.45), transparent 30%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
    overflow: hidden;
    width: 100%;
    min-width: 0;
  `,

  graphToolbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  `,

  zoomLabel: css`
    min-width: 72px;
    font-weight: 700;
  `,

  graphViewport: css`
    position: relative;
    overflow: auto;
    min-height: 560px;
    max-height: 72vh;
    padding: 20px;
    cursor: grab;
    touch-action: none;
    background:
      linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.96));
    background-size: 28px 28px, 28px 28px, 100% 100%;

    @media (max-width: 768px) {
      min-height: 440px;
      padding: 14px;
    }
  `,

  graphViewportDragging: css`
    cursor: grabbing;
    user-select: none;
  `,

  graphCanvas: css`
    position: relative;
    min-width: 100%;
  `,

  graphSvg: css`
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  `,

  nodeCard: css`
    position: absolute;
    padding: 12px 14px;
    border-radius: 16px;
    border: 2px solid;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(10px);
    text-align: left;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
    }
  `,

  nodeCardSelected: css`
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.16), 0 18px 36px rgba(15, 23, 42, 0.16);
    border-color: #2563eb !important;
    transform: translateY(-2px);
  `,

  nodeType: css`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.72;
  `,

  nodeLabel: css`
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    margin-top: 6px;
  `,

  nodeSubtitle: css`
    font-size: 12px;
    line-height: 1.35;
    margin-top: 6px;
    opacity: 0.8;
  `,

  minimapShell: css`
    position: sticky;
    right: 14px;
    bottom: 14px;
    margin-left: auto;
    width: fit-content;
    padding: 10px;
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(12px);
  `,

  minimapHeader: css`
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #475569;
  `,

  minimap: css`
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid rgba(203, 213, 225, 0.9);
    background:
      linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      #f8fafc;
    background-size: 16px 16px;
    cursor: crosshair;
  `,

  minimapSvg: css`
    display: block;
  `,

  minimapViewport: css`
    fill: rgba(59, 130, 246, 0.14);
    stroke: #2563eb;
    stroke-width: 2px;
  `,

  detailsStack: css`
    width: 100%;
  `,

  detailsTitle: css`
    margin-bottom: 4px !important;
  `,

  detailsSubtitle: css`
    margin-bottom: 12px !important;
  `,

  detailsMeta: css`
    .ant-descriptions-item-label {
      color: #64748b;
      width: 112px;
    }
  `,

  summaryTags: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  `,

  incidentList: css`
    margin-top: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow: hidden;
  `,

  incidentListItem: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: background 0.18s ease;

    &:hover {
      background: #f8fafc;
    }
  `,

  incidentListItemActive: css`
    background: #eff6ff;
  `,

  incidentListTitle: css`
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  `,

  incidentListSubtitle: css`
    margin-top: 4px;
    font-size: 12px;
    color: #64748b;
  `,
}));
