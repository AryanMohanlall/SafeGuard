import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  pageWrapper: css`
    max-width: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
  `,

  pageHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    flex-shrink: 0;
  `,

  pageTitle: css`
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  `,

  pageSubtitle: css`
    font-size: 14px;
    color: #64748b;
    margin-top: 4px;
    margin-bottom: 0;
  `,

  /* ── Kanban board ────────────────────────────────── */
  board: css`
    display: flex;
    gap: 14px;
    overflow-x: hidden;
    align-items: flex-start;
    flex: 1;
    padding-bottom: 16px;
  `,

  column: css`
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #f1f5f9;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    max-height: 100%;
    overflow: hidden;
  `,

  columnHeader: css`
    padding: 10px 14px 8px;
    border-radius: 12px 12px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
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
    scrollbar-color: #cbd5e1 transparent;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  `,

  columnEmpty: css`
    text-align: center;
    padding: 24px 12px;
    color: #94a3b8;
    font-size: 12px;
  `,

  /* ── Case cards ───────────────────────────────────── */
  caseCard: css`
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    transition: box-shadow 0.18s, border-color 0.18s, transform 0.12s;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09);
      border-color: #94a3b8;
      transform: translateY(-1px);
    }
  `,

  caseCardHeader: css`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
  `,

  caseNumber: css`
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.05em;
  `,

  caseTitle: css`
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    line-height: 1.4;
  `,

  caseMeta: css`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  `,

  caseDate: css`
    font-size: 10px;
    color: #94a3b8;
  `,

  /* ── Drawer ───────────────────────────────────────── */
  drawerSection: css`
    margin-bottom: 20px;
  `,

  drawerLabel: css`
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
  `,

  drawerValue: css`
    font-size: 14px;
    color: #0f172a;
  `,

  drawerTagGroup: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,

  drawerList: css`
    display: grid;
    gap: 10px;
  `,

  drawerTransitions: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,

  incidentCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    border-radius: 10px;
    padding: 10px 12px;
  `,

  incidentCardHeader: css`
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
    align-items: flex-start;
  `,

  incidentCardTitle: css`
    font-weight: 600;
    color: ${token.colorText};
  `,

  incidentCardLocation: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,

  incidentCardDate: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
    margin-top: 4px;
  `,

  evidenceCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    border-radius: 10px;
    padding: 12px 14px;
  `,

  evidenceCardHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  `,

  evidenceCardTitle: css`
    font-weight: 600;
    color: ${token.colorText};
  `,

  evidenceTagGroup: css`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  `,

  evidenceMeta: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
    display: grid;
    gap: 4px;
  `,

  evidenceBlockchainRef: css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
  `,

  boardLoading: css`
    text-align: center;
    padding: 60px;
  `,

  formTwoColumn: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
  `,
}));
