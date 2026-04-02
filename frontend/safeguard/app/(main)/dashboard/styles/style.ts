import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  pageWrapper: css`
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 16px 32px;

    @media (max-width: 640px) {
      padding: 0 12px 24px;
    }
  `,

  pageHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 16px;
    }
  `,

  headerBadgeRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `,

  pageTitle: css`
    margin: 0;
    font-size: 30px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #162033;

    @media (max-width: 640px) {
      font-size: 24px;
    }
  `,

  pageSubtitle: css`
    margin: 8px 0 0;
    max-width: 720px;
    font-size: 14px;
    line-height: 1.55;
    color: #5a6a83;
  `,

  heroCard: css`
    margin-bottom: 24px;
    border: 1px solid rgba(125, 145, 170, 0.24);
    border-radius: 24px;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(90, 120, 160, 0.18), transparent 28%),
      radial-gradient(circle at bottom right, rgba(122, 146, 176, 0.16), transparent 30%),
      linear-gradient(135deg, #f4f7fb 0%, #e7edf5 52%, #edf2f8 100%);
    box-shadow: 0 18px 40px rgba(31, 41, 55, 0.08);

    :global(.ant-card-body) {
      padding: 24px;
    }
  `,

  heroGrid: css`
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
    gap: 24px;
    align-items: end;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  `,

  heroEyebrow: css`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4d698f;
  `,

  heroTitle: css`
    margin-top: 10px;
    max-width: 640px;
    font-size: 26px;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #172133;

    @media (max-width: 640px) {
      font-size: 22px;
    }
  `,

  heroText: css`
    margin-top: 12px;
    max-width: 620px;
    font-size: 14px;
    line-height: 1.65;
    color: #5d6d86;
  `,

  heroStats: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,

  heroStat: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 18px;
    border: 1px solid rgba(125, 145, 170, 0.2);
    border-radius: 18px;
    background: rgba(248, 250, 253, 0.82);
    backdrop-filter: blur(8px);
  `,

  heroStatValue: css`
    font-size: 28px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #172133;
  `,

  heroStatLabel: css`
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #708099;
  `,

  card: css`
    border-radius: 18px;
    box-shadow: 0 10px 28px rgba(36, 50, 71, 0.06);
    border: 1px solid rgba(217, 225, 235, 0.96);
    background: rgba(248, 250, 253, 0.98);

    :global(.ant-card-body) {
      padding: 20px;
    }

    @media (max-width: 640px) {
      :global(.ant-card-body) {
        padding: 16px;
      }
    }
  `,

  sectionLabel: css`
    margin: 0 0 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: #8a98ac;
  `,

  chartControls: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;

    @media (max-width: 768px) {
      justify-content: flex-start;
      width: 100%;
    }

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;

      :global(.ant-segmented) {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }

      :global(.ant-segmented-group) {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
      }

      :global(.ant-segmented-item) {
        min-width: 0;
        flex: 1 1 0;
      }

      :global(.ant-segmented-item-label) {
        white-space: normal;
        line-height: 1.25;
        padding-inline: 10px;
      }
    }
  `,

  chartHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
    min-width: 0;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  `,

  chartTitleRow: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  `,

  chartCanvas: css`
    width: 100%;
    min-width: 0;
    overflow: hidden;

    @media (max-width: 640px) {
      margin-inline: -4px;
    }
  `,

  chartTitle: css`
    font-size: 18px;
    font-weight: 700;
    color: #162033;
  `,

  chartSupportText: css`
    margin: -8px 0 16px;
    font-size: 12px;
    color: #6c7b91;
  `,

  dispatchMeta: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  dispatchActions: css`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;

    @media (max-width: 991px) {
      justify-content: flex-start;
    }
  `,

  statSuffix: css`
    font-size: 13px;
    color: #94a3b8;
  `,

  emptyState: css`
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #c7d2df;
    border-radius: 16px;
    color: #66758c;
    font-size: 14px;
    text-align: center;
    padding: 20px;
  `,

  loadingWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  `,

  heatmapContainer: css`
    height: 460px;
    border-radius: 14px;
    overflow: hidden;

    @media (max-width: 768px) {
      height: 360px;
    }

    @media (max-width: 480px) {
      height: 300px;
    }
  `,

  heatmapEmpty: css`
    height: 460px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8797ac;
    font-size: 14px;

    @media (max-width: 768px) {
      height: 360px;
    }

    @media (max-width: 480px) {
      height: 300px;
      padding: 0 16px;
      text-align: center;
    }
  `,

  mapLoadingContainer: css`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8797ac;
  `,

  iconPrimary: css`
    color: ${token.colorPrimary};
  `,

  iconSuccess: css`
    color: ${token.colorSuccess};
  `,

  iconWarning: css`
    color: ${token.colorWarning};
  `,

  iconInfo: css`
    color: ${token.colorInfo};
  `,
}));
