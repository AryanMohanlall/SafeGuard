import { createStyles } from 'antd-style';

export const useStyles = createStyles(() => ({
  pageWrapper: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    marginBottom: 0,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  tableActions: {
    display: 'flex',
    gap: 8,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 500,
  },
  drawerForm: {
    paddingTop: 8,
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
    margin: '20px 0',
  },
  coordRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  datePickerFull: {
    width: '100%',
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
    margin: 0,
  },
  anonymousHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 0,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  detailField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#94a3b8',
    margin: 0,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    margin: 0,
  },
}));
