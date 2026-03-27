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
    gap: 12,
    marginTop: 32,
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  datePickerFull: {
    width: '100%',
  },
}));
