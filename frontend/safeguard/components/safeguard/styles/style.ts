import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  graphContainer: css`
    position: relative;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 30%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
    overflow: hidden;
    width: 100%;
    min-width: 0;
  `,

  graphToolbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${token.marginSM}px;
    padding: ${token.paddingSM}px ${token.padding}px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
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

    @media (max-width: 576px) {
      min-width: 64px;
    }
  `,

  graphViewport: css`
    position: relative;
    overflow: auto;
    min-height: 560px;
    max-height: 72vh;
    padding: ${token.paddingLG}px;
    cursor: grab;
    touch-action: none;
    background:
      linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.96));
    background-size: 28px 28px, 28px 28px, 100% 100%;

    @media (max-width: 768px) {
      min-height: 440px;
      max-height: 65vh;
      padding: ${token.paddingSM}px;
    }

    @media (max-width: 576px) {
      min-height: 380px;
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
    padding: ${token.paddingSM}px ${token.paddingSM}px;
    border-radius: ${token.borderRadiusLG}px;
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

  nodeCardConnected: css`
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 18px 36px rgba(15, 23, 42, 0.14);
  `,

  nodeCardDimmed: css`
    opacity: 0.38;
    filter: saturate(0.72);
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
    position: absolute;
    right: ${token.marginSM}px;
    bottom: ${token.marginSM}px;
    width: fit-content;
    padding: ${token.paddingXS}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(12px);
    z-index: 2;

    @media (max-width: 768px) {
      right: ${token.marginXS}px;
      bottom: ${token.marginXS}px;
      transform: scale(0.82);
      transform-origin: bottom right;
    }

    @media (max-width: 576px) {
      display: none;
    }
  `,

  minimapHeader: css`
    margin-bottom: ${token.marginXS}px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${token.colorTextSecondary};
  `,

  minimap: css`
    overflow: hidden;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
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
      color: ${token.colorTextSecondary};
      width: 112px;
    }

    @media (max-width: 576px) {
      .ant-descriptions-item-label,
      .ant-descriptions-item-content {
        overflow-wrap: anywhere;
      }
    }
  `,

  summaryTags: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  `,

  incidentList: css`
    margin-top: ${token.marginSM}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
  `,

  incidentListItem: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${token.marginSM}px;
    padding: ${token.paddingSM}px ${token.padding}px;
    cursor: pointer;
    transition: background 0.18s ease;

    &:hover {
      background: ${token.colorFillAlter};
    }

    @media (max-width: 576px) {
      flex-direction: column;
    }
  `,

  incidentListItemActive: css`
    background: ${token.colorPrimaryBg};
  `,

  incidentListTitle: css`
    font-size: 14px;
    font-weight: 700;
    color: ${token.colorTextHeading};
  `,

  incidentListSubtitle: css`
    margin-top: ${token.marginXXS}px;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
}));
