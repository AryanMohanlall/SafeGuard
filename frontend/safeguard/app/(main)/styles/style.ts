import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  outerLayout: css`
    height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(96, 165, 250, 0.18), transparent 24%),
      radial-gradient(circle at bottom left, rgba(148, 163, 184, 0.16), transparent 24%),
      linear-gradient(180deg, ${token.colorBgLayout} 0%, #d4dde8 100%);
  `,

  innerLayout: css`
    height: 100%;
    overflow: hidden;
    background: transparent;
  `,

  content: css`
    height: 100%;
    overflow-y: auto;
    padding: ${token.paddingLG}px;
    scrollbar-gutter: stable;
    position: relative;

    @media (max-width: 767px) {
      padding: ${token.paddingMD}px;
    }

    @media (max-width: 575px) {
      padding: ${token.padding}px;
    }
  `,
}));
