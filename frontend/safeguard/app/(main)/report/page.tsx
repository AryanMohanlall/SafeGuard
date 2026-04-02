'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, DatePicker, Form, Input, Switch, Upload, message } from 'antd';
import {
  AudioOutlined,
  CameraOutlined,
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
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied';
type RecordingStatus = 'idle' | 'recording' | 'recorded';
type CameraStatus = 'idle' | 'active';

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
  const [messageApi, contextHolder] = message.useMessage();
  const [anonymous, setAnonymous] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>(() =>
    typeof navigator !== 'undefined' && navigator.geolocation ? 'requesting' : 'idle'
  );
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Camera state
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied')
    );
  }, []);

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Attach stream to video element once it mounts after cameraStatus → 'active'
  useEffect(() => {
    if (cameraStatus === 'active' && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraStatus]);

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
      messageApi.error('Microphone access denied.');
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

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      cameraStreamRef.current = stream;
      setCameraStatus('active');
    } catch {
      messageApi.error('Camera access denied.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(blob));

      // Stop the stream and return to idle — preview is now shown
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      setCameraStatus('idle');
    }, 'image/jpeg', 0.92);
  };

  const closeCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    setCameraStatus('idle');
  };

  const handleReset = () => {
    form.resetFields();
    setAnonymous(false);
    clearRecording();
    clearImage();
    closeCamera();
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

    try {
      await create({
        title: values.title,
        description: values.description,
        location: values.location,
        anonymous: values.anonymous ?? false,
        occurredAt: values.occurredAt.toISOString(),
        reportedAt: new Date().toISOString(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        audioFile: audioBase64,
        audioFileName,
        audioContentType,
        imageFile: imageBase64,
        imageFileName,
        imageContentType,
      });

      messageApi.success('Incident submitted successfully.');
      handleReset();
    } catch {
      messageApi.error('Failed to submit the incident.');
    }
  };

  const locationSuffix =
    geoStatus === 'requesting' ? (
      <LoadingOutlined style={{ color: '#94a3b8' }} />
    ) : geoStatus === 'granted' ? (
      <EnvironmentOutlined style={{ color: '#2563eb' }} title="Location attached" />
    ) : null;

  return (
    <div className={styles.pageWrapper}>
      {contextHolder}
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
          initialValues={{ anonymous: false }}
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

              {/* Preview after file pick or camera capture */}
              {imagePreviewUrl && cameraStatus === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreviewUrl} alt="preview" className={styles.imagePreview} />
                  <Button icon={<DeleteOutlined />} size="small" danger onClick={clearImage}>
                    Remove
                  </Button>
                </div>
              )}

              {/* Live camera viewfinder */}
              {cameraStatus === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={styles.imagePreview}
                    style={{ maxHeight: 180, background: '#000' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button icon={<CameraOutlined />} type="primary" onClick={capturePhoto} style={{ flex: 1, background: '#2563eb', borderColor: '#2563eb' }}>
                      Capture
                    </Button>
                    <Button icon={<StopOutlined />} danger onClick={closeCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Buttons when no image and camera is off */}
              {!imagePreviewUrl && cameraStatus === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  <Button icon={<CameraOutlined />} block onClick={openCamera}>
                    Take Photo
                  </Button>
                </div>
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
