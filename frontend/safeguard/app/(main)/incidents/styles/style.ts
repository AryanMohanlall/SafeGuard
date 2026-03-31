import { createStyles } from 'antd-style';

export const useStyles = createStyles(() => ({
  pageWrapper: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 16px 32px',
    '@media (max-width: 640px)': {
      padding: '0 12px 24px',
    },
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 24,
    '@media (max-width: 640px)': {
      alignItems: 'stretch',
      marginBottom: 20,
    },
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    '@media (max-width: 640px)': {
      fontSize: 20,
    },
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
    '@media (max-width: 640px)': {
      padding: '16px',
    },
  },
  tableActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  toolbarMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  mapPanel: {
    height: 520,
    '@media (max-width: 768px)': {
      height: 420,
    },
    '@media (max-width: 480px)': {
      height: 320,
    },
  },
  mobileList: {
    display: 'grid',
    gap: 12,
  },
  mobileIncidentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 14,
    background: '#f8fafc',
  },
  mobileIncidentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  mobileIncidentTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
  },
  mobileIncidentMeta: {
    display: 'grid',
    gap: 8,
    marginTop: 10,
    color: '#475569',
    fontSize: 13,
  },
  mobileIncidentTags: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
    marginTop: 10,
  },
  mobileIncidentActions: {
    display: 'flex',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap' as const,
  },
  paginationWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 16,
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
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
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
  anonymousRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    gap: 12,
    '@media (max-width: 480px)': {
      alignItems: 'flex-start',
      flexDirection: 'column' as const,
    },
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
  drawerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    '@media (max-width: 480px)': {
      flexDirection: 'column-reverse' as const,
      '> button': {
        width: '100%',
      },
    },
  },
  infoBanner: {
    marginBottom: 16,
    padding: '12px 14px',
    borderRadius: 10,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e3a8a',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
}));
