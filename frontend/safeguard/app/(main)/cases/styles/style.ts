import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  pageWrapper: css`
    max-width: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
  `,

  pageHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: ${token.marginSM}px;
    margin-bottom: ${token.marginMD}px;
    flex-shrink: 0;
  `,

  pageHeaderContent: css`
    min-width: 0;
  `,

  pageHeaderAction: css`
    @media (max-width: 576px) {
      width: 100%;
    }
  `,

  pageTitle: css`
    font-size: 24px;
    font-weight: 700;
    color: ${token.colorTextHeading};
    margin: 0;

    @media (max-width: 480px) {
      font-size: 20px;
    }
  `,

  pageSubtitle: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
    margin-top: ${token.marginXXS}px;
    margin-bottom: 0;
  `,

  /* ── Kanban board ────────────────────────────────── */
  board: css`
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: flex-start;
    flex: 1;
    padding-bottom: ${token.paddingMD}px;
    -webkit-overflow-scrolling: touch;

    /* Hide scrollbar on desktop, show on mobile for discoverability */
    scrollbar-width: thin;
    scrollbar-color: ${token.colorBorderSecondary} transparent;
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: ${token.colorBorderSecondary}; border-radius: 3px; }

    @media (max-width: 767px) {
      margin-inline: calc(${token.marginSM}px * -1);
      padding-inline: ${token.paddingSM}px;
      padding-bottom: ${token.paddingSM}px;
      scroll-snap-type: x proximity;
    }
  `,

  column: css`
    flex: 1 1 0;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    background: ${token.colorFillAlter};
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
    max-height: 100%;
    overflow: hidden;

    @media (max-width: 767px) {
      flex: 0 0 min(82vw, 300px);
      scroll-snap-align: start;
    }
  `,

  columnHeader: css`
    padding: 10px 14px 8px;
    border-radius: ${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${token.marginXS}px;
    flex-shrink: 0;
  `,

  columnTitleWrap: css`
    display: flex;
    flex-direction: column;
  `,

  columnTitle: css`
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.2;
  `,

  columnSub: css`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.72);
    margin-top: 2px;
  `,

  columnCount: css`
    background: rgba(255, 255, 255, 0.25);
    border-radius: 10px;
    padding: 1px 9px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  `,

  columnBody: css`
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    flex: 1;

    scrollbar-width: thin;
    scrollbar-color: ${token.colorBorderSecondary} transparent;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: ${token.colorBorderSecondary}; border-radius: 2px; }
  `,

  columnEmpty: css`
    text-align: center;
    padding: ${token.paddingLG}px ${token.paddingSM}px;
    color: ${token.colorTextTertiary};
    font-size: ${token.fontSizeSM}px;
  `,

  /* ── Case cards ───────────────────────────────────── */
  caseCard: css`
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
    padding: ${token.paddingSM}px 14px;
    display: flex;
    flex-direction: column;
    gap: ${token.marginXS}px;
    cursor: pointer;
    transition: box-shadow ${token.motionDurationSlow}, border-color ${token.motionDurationSlow}, transform 0.12s;

    &:hover {
      box-shadow: ${token.boxShadow};
      border-color: ${token.colorBorderSecondary};
      transform: translateY(-1px);
    }
  `,

  caseCardHeader: css`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${token.marginXS}px;
  `,

  caseNumber: css`
    font-size: 10px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
    letter-spacing: 0.05em;
  `,

  caseTitle: css`
    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
    color: ${token.colorText};
    margin: 0;
    line-height: 1.4;
  `,

  caseMeta: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;
  `,

  caseDate: css`
    font-size: 10px;
    color: ${token.colorTextTertiary};
  `,

  /* ── Drawer ───────────────────────────────────────── */
  drawerSection: css`
    margin-bottom: ${token.marginMD}px;
  `,

  drawerSectionSpacer: css`
    margin-top: ${token.marginLG}px;
  `,

  drawerLabel: css`
    font-size: 11px;
    font-weight: 600;
    color: ${token.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: ${token.marginXXS}px;
  `,

  drawerValue: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
    overflow-wrap: anywhere;
  `,

  drawerTagGroup: css`
    display: flex;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;
  `,

  drawerList: css`
    display: grid;
    gap: 10px;
  `,

  drawerTransitions: css`
    display: flex;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;
  `,

  drawerActionButton: css`
    @media (max-width: 576px) {
      width: 100%;
    }
  `,

  incidentCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    padding: 10px 12px;
  `,

  incidentCardHeader: css`
    display: flex;
    justify-content: space-between;
    gap: ${token.marginXS}px;
    margin-bottom: ${token.marginXXS}px;
    align-items: flex-start;

    @media (max-width: 576px) {
      flex-direction: column;
    }
  `,

  incidentCardTitle: css`
    font-weight: 600;
    color: ${token.colorText};
  `,

  incidentCardLocation: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,

  incidentCardDate: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextTertiary};
    margin-top: ${token.marginXXS}px;
  `,

  evidenceCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    padding: ${token.paddingSM}px 14px;
  `,

  evidenceCardHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;
    margin-bottom: ${token.marginXS}px;
  `,

  evidenceCardTitle: css`
    font-weight: 600;
    color: ${token.colorText};
    overflow-wrap: anywhere;
  `,

  evidenceTagGroup: css`
    display: flex;
    gap: ${token.marginXXS}px;
    flex-wrap: wrap;
  `,

  evidenceMeta: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    display: grid;
    gap: ${token.marginXXS}px;

    code {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  `,

  evidenceBlockchainRef: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXXS}px;
  `,

  boardLoading: css`
    text-align: center;
    padding: 60px;
  `,

  formTwoColumn: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 ${token.margin}px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `,

  caseModalForm: css`
    margin-top: ${token.margin}px;
  `,
}));
