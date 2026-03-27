'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, DatePicker, Form, Input, Switch, Upload, message } from 'antd';
import {
  AudioOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PictureOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStyles } from './styles/style';
import { useIncidentAction } from '@/providers/incidents-provider';

const { TextArea } = Input;

interface IncidentFormValues {
  title: string;
  description: string;
  location: string;
  anonymous: boolean;
  occurredAt: dayjs.Dayjs;
  reportedAt: dayjs.Dayjs;
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied';
type RecordingStatus = 'idle' | 'recording' | 'recorded';

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const IncidentPage = () => {
  const { styles } = useStyles();
  const { create } = useIncidentAction();
  const [form] = Form.useForm<IncidentFormValues>();
  const [anonymous, setAnonymous] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied')
    );
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingStatus('recording');
    } catch {
      message.error('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecordingStatus('recorded');
  };

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingStatus('idle');
  };

  const clearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleReset = () => {
    form.resetFields();
    setAnonymous(false);
    clearRecording();
    clearImage();
  };

  const handleSubmit = async (values: IncidentFormValues) => {
    let audioBase64: string | null = null;
    let audioFileName: string | null = null;
    let audioContentType: string | null = null;

    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob);
      audioFileName = 'recording.webm';
      audioContentType = audioBlob.type || 'audio/webm';
    }

    let imageBase64: string | null = null;
    let imageFileName: string | null = null;
    let imageContentType: string | null = null;

    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
      imageFileName = imageFile.name;
      imageContentType = imageFile.type;
    }

    create({
      title: values.title,
      description: values.description,
      location: values.location,
      anonymous: values.anonymous ?? false,
      occurredAt: values.occurredAt.toISOString(),
      reportedAt: values.reportedAt.toISOString(),
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      audioFile: audioBase64,
      audioFileName,
      audioContentType,
      imageFile: imageBase64,
      imageFileName,
      imageContentType,
    });

    message.success('Incident submitted successfully.');
    handleReset();
  };

  const locationSuffix =
    geoStatus === 'requesting' ? (
      <LoadingOutlined style={{ color: '#94a3b8' }} />
    ) : geoStatus === 'granted' ? (
      <EnvironmentOutlined style={{ color: '#2563eb' }} title="Location attached" />
    ) : null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Report an Incident</h1>
        <p className={styles.pageSubtitle}>
          Submit a report about a crime or suspicious activity. All information is treated with strict confidentiality.
        </p>
      </div>

      <div className={styles.card}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ anonymous: false, reportedAt: dayjs() }}
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <p className={styles.sectionLabel}>Incident Details</p>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please provide a title.' }]}
          >
            <Input
              prefix={<FileTextOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Brief title describing the incident"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please describe the incident.' }]}
          >
            <TextArea
              placeholder="Provide as much detail as possible about what occurred..."
              rows={5}
              showCount
              maxLength={2000}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please provide a location.' }]}
            extra={
              geoStatus === 'granted'
                ? 'Your GPS coordinates will be attached to this report.'
                : geoStatus === 'denied'
                ? 'Location access denied — coordinates will not be attached.'
                : undefined
            }
          >
            <Input
              prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
              suffix={locationSuffix}
              placeholder="Address, area, or landmark"
              size="large"
            />
          </Form.Item>

          <div className={styles.divider} />

          <p className={styles.sectionLabel}>Media</p>

          <div className={styles.mediaGrid}>
            <div className={styles.mediaBox}>
              <p className={styles.mediaBoxLabel}>
                <AudioOutlined /> Voice Recording
              </p>

              {recordingStatus === 'idle' && (
                <Button icon={<AudioOutlined />} onClick={startRecording} block>
                  Start Recording
                </Button>
              )}

              {recordingStatus === 'recording' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={styles.recorderDot} />
                    <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>Recording...</span>
                  </div>
                  <Button icon={<StopOutlined />} danger onClick={stopRecording} block>
                    Stop
                  </Button>
                </div>
              )}

              {recordingStatus === 'recorded' && audioUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <audio src={audioUrl} controls className={styles.audioPlayer} />
                  <Button icon={<DeleteOutlined />} size="small" danger onClick={clearRecording}>
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className={styles.mediaBox}>
              <p className={styles.mediaBoxLabel}>
                <PictureOutlined /> Photo
              </p>

              {imagePreviewUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <img src={imagePreviewUrl} alt="preview" className={styles.imagePreview} />
                  <Button icon={<DeleteOutlined />} size="small" danger onClick={clearImage}>
                    Remove
                  </Button>
                </div>
              ) : (
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setImageFile(file);
                    setImagePreviewUrl(URL.createObjectURL(file));
                    return false;
                  }}
                >
                  <Button icon={<PictureOutlined />} block>
                    Choose Photo
                  </Button>
                </Upload>
              )}
            </div>
          </div>

          <div className={styles.divider} />

          <p className={styles.sectionLabel}>Timing</p>

          <div className={styles.dateGrid}>
            <Form.Item
              name="occurredAt"
              label="Date & Time Occurred"
              rules={[{ required: true, message: 'Please select when the incident occurred.' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="Select date and time"
                className={styles.datePickerFull}
                size="large"
                disabledDate={(d) => d.isAfter(dayjs())}
              />
            </Form.Item>

            <Form.Item name="reportedAt" label="Date & Time Reported">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className={styles.datePickerFull}
                size="large"
                disabled
              />
            </Form.Item>
          </div>

          <div className={styles.divider} />

          <p className={styles.sectionLabel}>Privacy</p>

          <Form.Item name="anonymous" valuePropName="checked" noStyle>
            <div className={styles.anonymousRow}>
              <div>
                <p className={styles.anonymousLabel}>Submit anonymously</p>
                <p className={styles.anonymousHint}>
                  Your identity will not be attached to this incident
                </p>
              </div>
              <Switch
                checked={anonymous}
                onChange={(val) => {
                  setAnonymous(val);
                  form.setFieldValue('anonymous', val);
                }}
                style={{ background: anonymous ? '#2563eb' : undefined }}
              />
            </div>
          </Form.Item>

          <div className={styles.submitRow}>
            <Button size="large" onClick={handleReset}>
              Clear
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              style={{ background: '#2563eb', borderColor: '#2563eb', minWidth: 140 }}
            >
              Submit Incident
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default IncidentPage;
