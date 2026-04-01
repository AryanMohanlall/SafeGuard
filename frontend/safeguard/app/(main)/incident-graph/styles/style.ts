import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => ({
  pageWrapper: css`
    display: grid;
    gap: 20px;
    min-width: 0;
    overflow-x: clip;
  `,

  pageHeader: css`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    align-items: flex-start;
  `,

  pageTitle: css`
    margin: 0;
    font-size: 30px;
    color: #0f172a;
  `,

  pageSubtitle: css`
    margin-top: 8px;
    margin-bottom: 0;
    max-width: 760px;
    color: #475569;
  `,

  graphCard: css`
    min-width: 0;
    overflow: hidden;
  `,

  cellTitle: css`
    font-weight: 700;
    color: #0f172a;
  `,

  cellMeta: css`
    font-size: 12px;
    color: #64748b;
  `,

  expandedRow: css`
    display: grid;
    gap: 8px;
  `,

  expandedIncidentIds: css`
    margin-top: 6px;
  `,

  reasonList: css`
    margin: 8px 0 0 18px;
    color: #475569;
  `,
}));
