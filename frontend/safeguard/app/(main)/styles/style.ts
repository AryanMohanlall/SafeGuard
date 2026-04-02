import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  content: css`
    overflow-y: auto;
    padding: ${token.paddingLG}px;

    @media (max-width: 767px) {
      padding: ${token.paddingMD}px;
    }

    @media (max-width: 575px) {
      padding: ${token.padding}px;
    }
  `,
}));
