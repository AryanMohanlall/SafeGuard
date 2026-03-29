import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => ({
  pageWrapper: css`
    max-width: 1200px;
    margin: 0 auto;
  `,

  pageHeader: css`
    margin-bottom: 28px;
  `,

  pageTitle: css`
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  `,

  pageSubtitle: css`
    font-size: 14px;
    color: #243143;
    margin-top: 4px;
    margin-bottom: 0;
  `,

  card: css`
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
  `,

  sectionLabel: css`
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 0;
    margin-bottom: 16px;
  `,

  statSuffix: css`
    font-size: 13px;
    color: #94a3b8;
  `,

  loadingWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  `,

  heatmapContainer: css`
    height: 460px;
  `,

  heatmapEmpty: css`
    height: 460px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 14px;
  `,

  mapLoadingContainer: css`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  `,
}));
