'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  { icon: <SafetyOutlined />, label: 'Blockchain-secured evidence chain of custody' },
  { icon: <AimOutlined />,    label: 'AI-powered crime prediction and GIS heatmaps' },
  { icon: <TeamOutlined />,   label: 'Real-time multi-agency coordination hub' },
  { icon: <GlobalOutlined />, label: 'End-to-end court readiness tooling' },
];

export default function LoginPage() {
  const { styles } = useStyles();
  const [form] = Form.useForm<LoginFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const { login } = useAuthAction();
  const { isPending, isSuccess, isError } = useAuthState();

  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Signed in successfully.');
      router.push('/dashboard');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      messageApi.error('Invalid credentials. Please try again.');
    }
  }, [isError]);

  const handleSubmit = ({ email, password }: LoginFormValues) => {
    login(email, password);
  };

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        {/* ── Left branding panel ── */}
        <div className={`${styles.leftPanel} hidden lg:flex`}>
          <div className={styles.leftPanelInner}>
            <SafetyOutlined style={{ fontSize: 56, color: '#60a5fa', marginBottom: 20 }} />
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
            <div className={`${styles.mobileBrand} flex lg:hidden`}>
              <SafetyOutlined style={{ fontSize: 28, color: '#2563eb' }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                SafeGuard
              </span>
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
                  prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    Password
                    <Link href="/forgot-password" style={{ fontSize: 13 }}>
                      Forgot password?
                    </Link>
                  </span>
                }
                rules={[{ required: true, message: 'Please enter your password.' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked" initialValue={false}>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
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
}
