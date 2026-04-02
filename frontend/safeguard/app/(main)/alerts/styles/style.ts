import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  page: css`
    display: flex;
    gap: 0;
    min-height: calc(100vh - 64px);
    margin: -24px;
    background: ${token.colorBgLayout};

    @media (max-width: 991px) {
      flex-direction: column;
      min-height: auto;
    }
  `,

  panel: css`
    min-height: calc(100vh - 64px);

    @media (max-width: 991px) {
      min-height: auto;
    }
  `,

  leftPanel: css`
    width: 40%;
    min-width: 360px;
    border-right: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};

    @media (max-width: 1200px) {
      min-width: 320px;
    }

    @media (max-width: 991px) {
      width: 100%;
      min-width: 0;
      order: 2;
      border-right: 0;
      border-top: 1px solid ${token.colorBorderSecondary};
    }
  `,

  rightPanel: css`
    width: 60%;
    background: ${token.colorBgContainer};

    @media (max-width: 991px) {
      width: 100%;
      order: 1;
    }
  `,

  leftScroll: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    padding: 20px;

    @media (max-width: 991px) {
      height: auto;
      overflow: visible;
    }
  `,

  headerBlock: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  pageTitle: css`
    margin: 0 !important;
  `,

  statsGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  `,

  statCard: css`
    border-color: ${token.colorBorderSecondary};
  `,

  sectionCard: css`
    border-color: ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};

    .ant-card-head {
      min-height: 48px;
    }
  `,

  listItem: css`
    padding: 0 !important;
    border: 0 !important;

    & + & {
      margin-top: 12px;
    }
  `,

  incidentCard: css`
    width: 100%;
    border-color: ${token.colorBorderSecondary};
    background: ${token.colorBgElevated};
  `,

  cardHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  `,

  cardTitle: css`
    margin-top: 8px;
    font-size: 15px;
    font-weight: 700;
    color: ${token.colorText};
  `,

  metaRow: css`
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: ${token.colorTextSecondary};
  `,

  routeText: css`
    color: ${token.colorInfo};
    font-weight: 500;
  `,

  responderCard: css`
    width: 100%;
    border-color: ${token.colorBorderSecondary};
    background: ${token.colorBgElevated};
  `,

  responderRow: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  responderAvatar: css`
    font-weight: 700;
    border: 2px solid transparent;
  `,

  avatarAvailable: css`
    color: ${token.colorSuccess};
    background: ${token.colorSuccessBg};
    border-color: ${token.colorSuccessBorder};
  `,

  avatarEnRoute: css`
    color: ${token.colorWarning};
    background: ${token.colorWarningBg};
    border-color: ${token.colorWarningBorder};
  `,

  avatarOnScene: css`
    color: ${token.colorError};
    background: ${token.colorErrorBg};
    border-color: ${token.colorErrorBorder};
  `,

  responderMetaBlock: css`
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  `,

  responderName: css`
    font-size: 14px;
    font-weight: 700;
    color: ${token.colorText};
  `,

  collapse: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
  `,

  caseActivityRow: css`
    cursor: pointer;
    padding-inline: 0 !important;
    transition: background ${token.motionDurationSlow};

    &:hover {
      background: ${token.colorFillQuaternary};
    }
  `,

  caseActivityContent: css`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
    }
  `,

  caseActivityMeta: css`
    justify-content: flex-end;
  `,

  caseNumber: css`
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${token.colorTextSecondary};
  `,

  caseTitle: css`
    font-size: 14px;
    font-weight: 600;
    color: ${token.colorText};
  `,

  mapSurface: css`
    position: relative;
    height: calc(100vh - 64px);
    min-height: calc(100vh - 64px);
    overflow: hidden;

    :global(.safeguard-alerts-leaflet) {
      height: 100%;
      width: 100%;
      touch-action: pan-x pan-y pinch-zoom;
      cursor: grab;
    }

    :global(.safeguard-alerts-leaflet.leaflet-grab),
    :global(.safeguard-alerts-leaflet .leaflet-grab) {
      cursor: grab;
    }

    :global(.safeguard-alerts-leaflet.leaflet-dragging),
    :global(.safeguard-alerts-leaflet .leaflet-dragging) {
      cursor: grabbing;
    }

    :global(.safeguard-alerts-leaflet .leaflet-control-container) {
      pointer-events: none;
    }

    :global(.safeguard-alerts-leaflet .leaflet-top),
    :global(.safeguard-alerts-leaflet .leaflet-right),
    :global(.safeguard-alerts-leaflet .leaflet-bottom),
    :global(.safeguard-alerts-leaflet .leaflet-left),
    :global(.safeguard-alerts-leaflet .leaflet-control),
    :global(.safeguard-alerts-leaflet .leaflet-pane),
    :global(.safeguard-alerts-leaflet .leaflet-marker-icon),
    :global(.safeguard-alerts-leaflet .leaflet-popup) {
      pointer-events: auto;
    }

    @media (max-width: 991px) {
      height: 60vh;
      min-height: 420px;
    }
  `,

  mapControls: css`
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 800;
    width: 220px;
    box-shadow: ${token.boxShadowSecondary};

    @media (max-width: 575px) {
      width: calc(100% - 32px);
    }
  `,

  legend: css`
    position: absolute;
    left: 16px;
    bottom: 16px;
    z-index: 800;
    box-shadow: ${token.boxShadowSecondary};
  `,

  legendSwatch: css`
    display: inline-block;
    width: 16px;
    height: 16px;
    border-width: 1px;
    border-style: solid;
    border-radius: ${token.borderRadiusSM}px;
  `,
}));
