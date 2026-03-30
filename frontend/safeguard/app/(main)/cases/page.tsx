'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Button, Drawer, Form, Input, Modal,
  Select, Spin, Tag,
} from 'antd';
import {
  CalendarOutlined,
  ExclamationCircleOutlined,
  FolderAddOutlined,
  FolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useCaseAction, useCaseState } from '@/providers/cases-provider';
import type { ICase, ICreateCaseInput } from '@/providers/cases-provider/context';
import { useStyles } from './styles/style';

const { TextArea } = Input;

// ── Pipeline definition ────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: 'Draft',        label: 'Draft',         sub: 'Case opened',       color: '#475569' },
  { key: 'Open',         label: 'Open',           sub: 'Assigned, active',  color: '#1d4ed8' },
  { key: 'UnderReview',  label: 'Under Review',   sub: 'Evidence gathered', color: '#6d28d9' },
  { key: 'PendingTrial', label: 'Pending Trial',  sub: 'Court ready',       color: '#92400e' },
  { key: 'Closed',       label: 'Closed',         sub: 'Verdict delivered', color: '#065f46' },
  { key: 'Void',         label: 'Void',           sub: 'Dropped',           color: '#7f1d1d' },
];

const SEVERITY_COLORS: Record<string, string> = {
  Low: 'default', Medium: 'warning', High: 'orange', Critical: 'error',
};

const STATUS_TAG_COLORS: Record<string, string> = {
  Draft: 'default', Open: 'blue', UnderReview: 'purple',
  PendingTrial: 'gold', Closed: 'green', Void: 'red',
};

function statusLabel(key: string) {
  return PIPELINE_STAGES.find((s) => s.key === key)?.label ?? key;
}

// ── Card ───────────────────────────────────────────────────────
function CaseCard({
  c,
  index,
  onClick,
}: {
  c: ICase;
  index: number;
  onClick: () => void;
}) {
  const { styles } = useStyles();
  return (
    <Draggable draggableId={c.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.caseCard}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.85 : 1,
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : undefined,
          }}
          onClick={onClick}
        >
          <div className={styles.caseCardHeader}>
            <span className={styles.caseNumber}>{c.caseNumber}</span>
            <Tag color={SEVERITY_COLORS[c.severity] ?? 'default'} style={{ margin: 0, fontSize: 10 }}>
              {c.severity}
            </Tag>
          </div>
          <p className={styles.caseTitle}>{c.title}</p>
          <div className={styles.caseMeta}>
            {c.category && <Tag style={{ margin: 0, fontSize: 10 }}>{c.category}</Tag>}
            <span className={styles.caseDate}>
              <CalendarOutlined style={{ marginRight: 3 }} />
              {new Date(c.openedAt).toLocaleDateString()}
            </span>
            {c.isCourtReady && (
              <Tag color="cyan" style={{ margin: 0, fontSize: 10 }}>Court Ready</Tag>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ── Kanban column ──────────────────────────────────────────────
function KanbanColumn({
  stage,
  cases,
  onCardClick,
}: {
  stage: typeof PIPELINE_STAGES[number];
  cases: ICase[];
  onCardClick: (c: ICase) => void;
}) {
  const { styles } = useStyles();
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader} style={{ background: stage.color }}>
        <div className={styles.columnTitleWrap}>
          <span className={styles.columnTitle}>{stage.label}</span>
          <span className={styles.columnSub}>{stage.sub}</span>
        </div>
        <span className={styles.columnCount}>{cases.length}</span>
      </div>
      <Droppable droppableId={stage.key}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.columnBody}
            style={{
              background: snapshot.isDraggingOver
                ? 'rgba(0,0,0,0.04)'
                : undefined,
              transition: 'background 0.15s',
            }}
          >
            {cases.length === 0 && !snapshot.isDraggingOver ? (
              <div className={styles.columnEmpty}>
                <FolderOutlined style={{ fontSize: 20, display: 'block', marginBottom: 6 }} />
                No cases
              </div>
            ) : (
              cases.map((c, i) => (
                <CaseCard key={c.id} c={c} index={i} onClick={() => onCardClick(c)} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function CasesPage() {
  const { styles } = useStyles();
  const { items, isPending } = useCaseState();
  const { fetchAll, create, transitionStatus } = useCaseAction();

  const [selected, setSelected] = useState<ICase | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [transitionModal, setTransitionModal] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{ caseItem: ICase; toStatus: string } | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { fetchAll(); }, []);

  const casesForStage = (key: string) => items.filter((c) => c.status === key);

  // Called when a card is dropped
  const onDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const caseItem = items.find((c) => c.id === draggableId);
    if (!caseItem) return;

    // Show confirmation modal before committing
    setPendingDrop({ caseItem, toStatus: destination.droppableId });
    setTransitionModal(true);
  };

  const handleDropConfirm = () => {
    if (!pendingDrop) return;
    transitionStatus(pendingDrop.caseItem.id, pendingDrop.toStatus);
    setTransitionModal(false);
    setPendingDrop(null);
  };

  const handleDropCancel = () => {
    setTransitionModal(false);
    setPendingDrop(null);
  };

  const handleCreate = (values: ICreateCaseInput) => {
    create({ ...values, openedAt: new Date().toISOString() });
    form.resetFields();
    setCreateOpen(false);
  };

  // Drawer manual transition buttons
  const openManualTransition = (toStatus: string) => {
    if (!selected) return;
    setPendingDrop({ caseItem: selected, toStatus });
    setTransitionModal(true);
    setSelected(null);
  };

  const availableTransitions = selected
    ? PIPELINE_STAGES.filter((s) => s.key !== selected.status)
    : [];

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Case Management</h1>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          New Case
        </Button>
      </div>

      {/* Kanban board */}
      {isPending ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                cases={casesForStage(stage.key)}
                onCardClick={setSelected}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.caseNumber ?? 'Case Detail'}
        width="min(560px, 100vw)"
        extra={
          <Tag color={STATUS_TAG_COLORS[selected?.status ?? ''] ?? 'default'}>
            {statusLabel(selected?.status ?? '')}
          </Tag>
        }
      >
        {selected && (
          <>
            <div className={styles.drawerSection}>
              <p className={styles.drawerLabel}>Title</p>
              <p className={styles.drawerValue}>{selected.title}</p>
            </div>

            {selected.summary && (
              <div className={styles.drawerSection}>
                <p className={styles.drawerLabel}>Summary</p>
                <p className={styles.drawerValue}>{selected.summary}</p>
              </div>
            )}

            <div className={styles.drawerSection}>
              <p className={styles.drawerLabel}>Severity / Category</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag color={SEVERITY_COLORS[selected.severity] ?? 'default'}>{selected.severity}</Tag>
                {selected.category && <Tag>{selected.category}</Tag>}
              </div>
            </div>

            <div className={styles.drawerSection}>
              <p className={styles.drawerLabel}>Opened</p>
              <p className={styles.drawerValue}>{new Date(selected.openedAt).toLocaleString()}</p>
            </div>

            {selected.closedAt && (
              <div className={styles.drawerSection}>
                <p className={styles.drawerLabel}>Closed</p>
                <p className={styles.drawerValue}>{new Date(selected.closedAt).toLocaleString()}</p>
              </div>
            )}

            {selected.closureReason && (
              <div className={styles.drawerSection}>
                <p className={styles.drawerLabel}>Closure Reason</p>
                <p className={styles.drawerValue}>{selected.closureReason}</p>
              </div>
            )}

            {selected.aiSummary && (
              <div className={styles.drawerSection}>
                <p className={styles.drawerLabel}>AI Summary</p>
                <p className={styles.drawerValue}>{selected.aiSummary}</p>
              </div>
            )}

            {selected.isCourtReady && (
              <div className={styles.drawerSection}>
                <Tag color="cyan" icon={<ExclamationCircleOutlined />}>Court Ready</Tag>
              </div>
            )}

            <div className={styles.drawerSection} style={{ marginTop: 24 }}>
              <p className={styles.drawerLabel}>Move to stage</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {availableTransitions.map((s) => (
                  <Button
                    key={s.key}
                    size="small"
                    style={{ background: s.color, color: '#fff', border: 'none' }}
                    onClick={() => openManualTransition(s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </Drawer>

      {/* Transition confirm modal (drag-drop + manual) */}
      <Modal
        open={transitionModal}
        title="Confirm Status Transition"
        onOk={handleDropConfirm}
        onCancel={handleDropCancel}
        okText="Confirm"
      >
        {pendingDrop && (
          <p>
            Move <strong>{pendingDrop.caseItem.caseNumber}</strong> from{' '}
            <Tag color={STATUS_TAG_COLORS[pendingDrop.caseItem.status] ?? 'default'}>
              {statusLabel(pendingDrop.caseItem.status)}
            </Tag>
            to{' '}
            <Tag color={STATUS_TAG_COLORS[pendingDrop.toStatus] ?? 'default'}>
              {statusLabel(pendingDrop.toStatus)}
            </Tag>?
          </p>
        )}
      </Modal>

      {/* Create case modal */}
      <Modal
        open={createOpen}
        title={<><FolderAddOutlined style={{ marginRight: 8 }} />New Case</>}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Create"
        width={540}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="Brief case title" />
          </Form.Item>

          <Form.Item name="summary" label="Summary">
            <TextArea rows={3} placeholder="Full narrative description" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
              <Select placeholder="Select severity">
                <Select.Option value="Low">Low</Select.Option>
                <Select.Option value="Medium">Medium</Select.Option>
                <Select.Option value="High">High</Select.Option>
                <Select.Option value="Critical">Critical</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Initial Status" initialValue="Draft">
              <Select>
                <Select.Option value="Draft">Draft</Select.Option>
                <Select.Option value="Open">Open</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select category" allowClear>
              {['Theft', 'Assault', 'Fraud', 'Homicide', 'Vandalism', 'Drug Offence', 'Other'].map((c) => (
                <Select.Option key={c} value={c}>{c}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
