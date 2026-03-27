'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Form, Input, message, Typography } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  SafetyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { useAuthAction, useAuthState } from '@/providers/auth-provider';
import { styles } from './styles/style';

const { Text } = Typography;

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const stats = [
  { value: '10K+',   label: 'Cases managed' },
  { value: '500+',   label: 'Agencies onboarded' },
  { value: '99.9%',  label: 'Uptime SLA' },
  { value: '256-bit', label: 'Encryption' },
];

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const { register } = useAuthAction();
  const { isPending, isSuccess, isError } = useAuthState();

  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Account created! Redirecting…');
      router.push('/');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      messageApi.error('Registration failed. Please try again.');
    }
  }, [isError]);

  const handleSubmit = ({ firstName, lastName, email, password }: RegisterFormValues) => {
    register({
      name: firstName,
      surname: lastName,
      userName: email,
      emailAddress: email,
      password,
    });
  };

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        {/* ── Left branding panel ── */}
        <div style={styles.leftPanel} className="hidden lg:flex">
          <div style={styles.leftPanelInner}>
            <SafetyOutlined style={styles.brandIcon} />
            <h1 style={styles.brandTitle}>SafeGuard</h1>
            <p style={styles.brandTagline}>
              Join thousands of law enforcement professionals, legal experts, and
              judiciary members on the platform that&apos;s digitising justice.
            </p>
            <div style={styles.divider} />
            <div style={styles.statGrid}>
              {stats.map((s) => (
                <div key={s.label} style={styles.statCard}>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrapper}>
            {/* Mobile brand mark */}
            <div style={styles.mobileBrand} className="flex lg:hidden">
              <SafetyOutlined style={{ fontSize: 28, color: '#2563eb' }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                SafeGuard
              </span>
            </div>

            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Create an account</h2>
              <p style={styles.formSubtitle}>Join the SafeGuard platform today</p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              size="large"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item
                  name="firstName"
                  label="First name"
                  rules={[{ required: true, message: 'Required.' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                    placeholder="Jane"
                    autoComplete="given-name"
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Last name"
                  rules={[{ required: true, message: 'Required.' }]}
                >
                  <Input
                    placeholder="Smith"
                    autoComplete="family-name"
                  />
                </Form.Item>
              </div>

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
                label="Password"
                rules={[
                  { required: true, message: 'Please enter a password.' },
                  { min: 8, message: 'Password must be at least 8 characters.' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match.'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  style={styles.submitButton}
                >
                  Create account
                </Button>
              </Form.Item>
            </Form>

            <div style={styles.signinRow}>
              <Text type="secondary">Already have an account?&nbsp;</Text>
              <Link href="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
