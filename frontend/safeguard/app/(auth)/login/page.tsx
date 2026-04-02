'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Checkbox, Form, Input, message, Typography } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  AimOutlined,
  TeamOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuthAction, useAuthState } from '@/providers/auth-provider';
import { useStyles } from './styles/style';

const { Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const features = [
  { icon: <AimOutlined />,    label: 'AI-powered crime prediction and GIS heatmaps' },
  { icon: <TeamOutlined />,   label: 'Real-time multi-agency coordination hub' },
  { icon: <GlobalOutlined />, label: 'End-to-end court readiness tooling' },
];

const LoginPage = () => {
  const { styles } = useStyles();
  const [form] = Form.useForm<LoginFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const { login } = useAuthAction();
  const { isPending, isSuccess, isError } = useAuthState();

  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Signed in successfully.');
    }
  }, [isSuccess, messageApi]);

  useEffect(() => {
    if (isError) {
      messageApi.error('Invalid credentials. Please try again.');
    }
  }, [isError, messageApi]);

  const handleSubmit = ({ email, password }: LoginFormValues) => {
    login(email, password);
  };

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        {/* ── Left branding panel ── */}
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelInner}>
            <SafetyOutlined className={styles.brandIcon} />
            <h1 className={styles.brandTitle}>SafeGuard</h1>
            <p className={styles.brandTagline}>
              Digitising the Justice System — connecting victims, law enforcement,
              and the judiciary through one intelligent platform.
            </p>
            <div className={styles.divider} />
            <div className={styles.featureList}>
              {features.map((f) => (
                <div key={f.label} className={styles.featureItem}>
                  <span className={styles.featureIconWrap}>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className={styles.rightPanel}>
          <div className={styles.formWrapper}>
            {/* Mobile brand mark */}
            <div className={styles.mobileBrand}>
              <SafetyOutlined className={styles.mobileBrandIcon} />
              <span className={styles.mobileBrandTitle}>SafeGuard</span>
            </div>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Welcome back</h2>
              <p className={styles.formSubtitle}>Sign in to your SafeGuard account</p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                name="email"
                label="Email address"
                rules={[
                  { required: true, message: 'Please enter your email.' },
                  { type: 'email', message: 'Please enter a valid email.' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className={styles.inputPrefixIcon} />}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password.' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className={styles.inputPrefixIcon} />}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item className={styles.formItemLast}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  className={styles.submitButton}
                >
                  Sign in
                </Button>
              </Form.Item>
            </Form>

            <div className={styles.signupRow}>
              <Text type="secondary">Don&apos;t have an account?&nbsp;</Text>
              <Link href="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
