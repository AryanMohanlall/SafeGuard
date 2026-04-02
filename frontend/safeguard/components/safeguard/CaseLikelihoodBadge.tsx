'use client';

import { Tag } from 'antd';
import { createStyles } from 'antd-style';

interface Props {
  probability?: number;
  priorityTag?: 'HIGH' | 'MEDIUM' | 'LOW';
}

const useStyles = createStyles(() => ({
  badge: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: '0.02em',
  },
}));

const TAG_CONFIG = {
  HIGH:   { color: 'error'   as const, label: 'HIGH' },
  MEDIUM: { color: 'warning' as const, label: 'MED'  },
  LOW:    { color: 'default' as const, label: 'LOW'  },
} as const;

export const CaseLikelihoodBadge = ({ probability, priorityTag }: Props) => {
  const { styles } = useStyles();

  if (priorityTag == null || probability == null) return null;

  const { color, label } = TAG_CONFIG[priorityTag];
  const pct = Math.round(probability * 100);

  return (
    <Tag color={color} className={styles.badge}>
      {label}&nbsp;&nbsp;{pct}%
    </Tag>
  );
}
