import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => ({
  pageWrapper: css`
    max-width: 1400px;
    margin: 0 auto;
  `,

  pageHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  `,

  managementCard: css`
    margin-bottom: 24px;
    border-radius: 16px;
    border: 1px solid rgba(37, 99, 235, 0.12);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  `,

  managementStack: css`
    width: 100%;
  `,

  managementForm: css`
    width: 100%;
  `,

  formHint: css`
    margin: 0 0 16px;
    font-size: 12px;
    color: #64748b;
  `,

  formGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 16px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  `,

  formItemWide: css`
    grid-column: span 2;

    @media (max-width: 900px) {
      grid-column: span 1;
    }
  `,

  numberInput: css`
    width: 100%;
  `,

  streamList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  streamListItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
    border: 1px solid rgba(148, 163, 184, 0.25);

    @media (max-width: 768px) {
      align-items: flex-start;
      flex-direction: column;
    }
  `,

  streamMeta: css`
    min-width: 0;
  `,

  streamName: css`
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  `,

  streamInfo: css`
    margin: 4px 0 0;
    font-size: 12px;
    color: #64748b;
    word-break: break-word;
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

  grid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  `,

  feedCard: css`
    background: #0a0f1e;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: border-color 0.2s;

    &:hover {
      border-color: rgba(37, 99, 235, 0.5);
    }
  `,

  feedCardActive: css`
    border-color: #2563eb !important;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25), 0 4px 20px rgba(0, 0, 0, 0.3);
  `,

  videoWrapper: css`
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #060b10;
    cursor: pointer;
  `,

  video: css`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    background: #020617;
  `,

  overlay: css`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(6, 11, 16, 0.75);
    gap: 10px;
  `,

  liveBadge: css`
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(220, 38, 38, 0.9);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    backdrop-filter: blur(4px);
  `,

  liveDot: css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    animation: pulse 1.4s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `,

  cardFooter: css`
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,

  cameraName: css`
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,

  cameraLocation: css`
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
    margin-bottom: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,

  cameraSource: css`
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
    margin-bottom: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,

  expandedView: css`
    background: #0a0f1e;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4);
    margin-bottom: 20px;
  `,

  expandedHeader: css`
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  `,

  expandedTitle: css`
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  `,

  expandedLocation: css`
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
    margin-bottom: 0;
  `,

  expandedMeta: css`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 6px;
    margin-bottom: 0;
  `,

  errorOverlay: css`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(6, 11, 16, 0.9);
    color: #64748b;
    font-size: 13px;
  `,

  inlineLink: css`
    color: #93c5fd;
    text-decoration: none;

    &:hover {
      color: #bfdbfe;
    }
  `,
}));
