import { createStyles } from 'antd-style';

export const useStyles = createStyles(() => ({
  pageWrapper: {
    maxWidth: 720,
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '32px 36px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    '@media (max-width: 640px)': {
      padding: '20px 16px',
    },
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#94a3b8',
    marginBottom: 16,
  },
  divider: {
    borderTop: '1px solid #f1f5f9',
    margin: '24px 0',
  },
  anonymousRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  anonymousLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: '#334155',
  },
  anonymousHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
    gap: 12,
    marginTop: 32,
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  datePickerFull: {
    width: '100%',
  },
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  mediaBox: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '16px',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    minHeight: 120,
  },
  mediaBoxLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    margin: 0,
  },
  recorderDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#ef4444',
    flexShrink: 0,
  },
  audioPlayer: {
    width: '100%',
    height: 36,
  },
  imagePreview: {
    width: '100%',
    borderRadius: 6,
    objectFit: 'cover' as const,
    maxHeight: 120,
    border: '1px solid #e2e8f0',
  },
}));
