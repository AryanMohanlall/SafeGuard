import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  pageWrapper: css`
    display: grid;
    gap: ${token.marginLG}px;
    min-width: 0;
    overflow-x: hidden;
  `,

  pageHeader: css`
    display: flex;
    justify-content: space-between;
    gap: ${token.marginMD}px;
    flex-wrap: wrap;
    align-items: flex-start;
  `,

  pageHeaderContent: css`
    min-width: 0;
    flex: 1 1 420px;
  `,

  pageActions: css`
    justify-content: flex-end;

    @media (max-width: 576px) {
      width: 100%;

      .ant-space-item {
        width: 100%;
      }
    }
  `,

  actionButton: css`
    @media (max-width: 576px) {
      width: 100%;
    }
  `,

  pageTitle: css`
    margin: 0;
    font-size: 30px;
    color: ${token.colorTextHeading};

    @media (max-width: 576px) {
      font-size: 24px;
    }
  `,

  pageSubtitle: css`
    margin-top: ${token.marginXS}px;
    margin-bottom: 0;
    max-width: 760px;
    color: ${token.colorTextSecondary};
  `,

  statsRow: css`
    min-width: 0;
  `,

  statCard: css`
    height: 100%;
  `,

  graphCard: css`
    min-width: 0;
    overflow: hidden;
  `,

  tableCard: css`
    min-width: 0;
  `,

  cellTitle: css`
    font-weight: 700;
    color: ${token.colorTextHeading};
  `,

  cellMeta: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,

  expandedRow: css`
    display: grid;
    gap: ${token.marginSM}px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `,

  expandedIncidentIds: css`
    margin-top: ${token.marginXS}px;
  `,

  reasonList: css`
    margin: ${token.marginXS}px 0 0 ${token.marginLG}px;
    color: ${token.colorTextSecondary};
    padding: 0;
  `,
}));
