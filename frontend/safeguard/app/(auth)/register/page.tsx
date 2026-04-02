'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Form, Input, Radio, message, Typography } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  SafetyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { useAuthAction, useAuthState } from '@/providers/auth-provider';
import { useStyles } from './styles/style';

const { Text } = Typography;

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  roleName: 'Citizen' | 'Official';
  password: string;
  confirmPassword: string;
}

const stats = [
  { value: '10K+',   label: 'Cases managed' },
  { value: '500+',   label: 'Agencies onboarded' },
  { value: '99.9%',  label: 'Uptime SLA' },
  { value: '256-bit', label: 'Encryption' },
];

const RegisterPage = () => {
  const { styles } = useStyles();
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
  }, [isSuccess, messageApi, router]);

  useEffect(() => {
    if (isError) {
      messageApi.error('Registration failed. Please try again.');
    }
  }, [isError, messageApi]);

  const handleSubmit = ({ firstName, lastName, email, password, roleName }: RegisterFormValues) => {
    register({
      name: firstName,
      surname: lastName,
      userName: email,
      emailAddress: email,
      password,
      roleName,
    });
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
              Join thousands of law enforcement professionals, legal experts, and
              judiciary members on the platform that&apos;s digitising justice.
            </p>
            <div className={styles.divider} />
            <div className={styles.statGrid}>
              {stats.map((s) => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
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
              <h2 className={styles.formTitle}>Create an account</h2>
              <p className={styles.formSubtitle}>Join the SafeGuard platform today</p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              size="large"
              initialValues={{ roleName: 'Citizen' }}
            >
              <div className={styles.nameGrid}>
                <Form.Item
                  name="firstName"
                  label="First name"
                  rules={[{ required: true, message: 'Required.' }]}
                >
                  <Input
                    prefix={<UserOutlined className={styles.inputPrefixIcon} />}
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
                  prefix={<MailOutlined className={styles.inputPrefixIcon} />}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="roleName"
                label="Account role"
                rules={[{ required: true, message: 'Please choose a role.' }]}
              >
                <Radio.Group optionType="button" buttonStyle="solid" className={styles.radioGroup}>
                  <Radio.Button value="Citizen" className={styles.radioButton}>
                    Citizen
                  </Radio.Button>
                  <Radio.Button value="Official" className={styles.radioButton}>
                    Official
                  </Radio.Button>
                </Radio.Group>
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
                  prefix={<LockOutlined className={styles.inputPrefixIcon} />}
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
                  prefix={<LockOutlined className={styles.inputPrefixIcon} />}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
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
                  Create account
                </Button>
              </Form.Item>
            </Form>

            <div className={styles.signinRow}>
              <Text type="secondary">Already have an account?&nbsp;</Text>
              <Link href="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
