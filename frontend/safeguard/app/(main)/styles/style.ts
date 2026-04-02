import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  outerLayout: css`
    height: 100vh;
    overflow: hidden;
  `,

  innerLayout: css`
    height: 100%;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,

  content: css`
    height: 100%;
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
