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
  Select, Spin, Tag, message,
} from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileProtectOutlined,
  FolderAddOutlined,
  FolderOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useCaseAction, useCaseState } from '@/providers/cases-provider';
import type { ICase, ICreateCaseInput, IUpdateCaseInput } from '@/providers/cases-provider/context';
import { useEvidenceAction, useEvidenceState } from '@/providers/evidence-provider';
import type { IEvidence } from '@/providers/evidence-provider/context';
import { useIncidentAction, useIncidentState } from '@/providers/incidents-provider';
import type { IIncident } from '@/providers/incidents-provider/context';
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

const CASE_BOARD_FETCH_PARAMS = { skipCount: 0, maxResultCount: 1000 };

function statusLabel(key: string) {
  return PIPELINE_STAGES.find((s) => s.key === key)?.label ?? key;
}

function getIncidentDetailsForCase(caseItem: ICase, incidents: IIncident[]) {
  return incidents.filter((incident) => caseItem.incidentIds.includes(incident.id));
}

function getIncidentTitle(incidentId: string | null | undefined, incidents: IIncident[]) {
  if (!incidentId) return null;
  return incidents.find((incident) => incident.id === incidentId)?.title ?? incidentId;
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
            {c.incidentCount > 0 && (
              <Tag color="geekblue" style={{ margin: 0, fontSize: 10 }}>
                {c.incidentCount} incident{c.incidentCount === 1 ? '' : 's'}
              </Tag>
            )}
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
  const { fetchAll, create, update, transitionStatus } = useCaseAction();
  const { items: evidenceItems, isPending: evidencePending } = useEvidenceState();
  const { fetchAll: fetchAllEvidence } = useEvidenceAction();
  const { items: incidentItems } = useIncidentState();
  const { fetchAll: fetchAllIncidents } = useIncidentAction();

  const [selected, setSelected] = useState<ICase | null>(null);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [caseModalMode, setCaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingCase, setEditingCase] = useState<ICase | null>(null);
  const [transitionModal, setTransitionModal] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{ caseItem: ICase; toStatus: string } | null>(null);
  const [submittingCase, setSubmittingCase] = useState(false);
  const [form] = Form.useForm<ICreateCaseInput>();

  const getRequestErrorMessage = (error: unknown, fallback: string) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'error' in error.response.data &&
      typeof error.response.data.error === 'object' &&
      error.response.data.error !== null &&
      'message' in error.response.data.error &&
      typeof error.response.data.error.message === 'string'
    ) {
      return error.response.data.error.message;
    }

    return fallback;
  };

  useEffect(() => {
    fetchAll(CASE_BOARD_FETCH_PARAMS);
    fetchAllIncidents({ skipCount: 0, maxResultCount: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchAllEvidence({ caseId: selected.id, skipCount: 0, maxResultCount: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const casesForStage = (key: string) => items.filter((c) => c.status === key);
  const selectedIncidentDetails = selected
    ? getIncidentDetailsForCase(selected, incidentItems)
    : [];
  const assignableIncidents = incidentItems.filter(
    (incident) => !incident.caseId || incident.caseId === editingCase?.id
  );

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

  const handleCaseSubmit = async (values: ICreateCaseInput) => {
    setSubmittingCase(true);

    try {
      if (caseModalMode === 'edit' && editingCase) {
        const input: IUpdateCaseInput = {
          id: editingCase.id,
          title: values.title,
          summary: values.summary ?? null,
          status: values.status,
          severity: values.severity,
          category: values.category ?? null,
          incidentIds: values.incidentIds ?? [],
          isCourtReady: editingCase.isCourtReady,
          closedAt: editingCase.closedAt,
          closureReason: editingCase.closureReason,
        };

        await update(editingCase.id, input);
        setSelected(null);
        message.success('Case updated.');
      } else {
        await create({
          ...values,
          incidentIds: values.incidentIds ?? [],
          openedAt: new Date().toISOString(),
        });
        message.success('Case created.');
      }

      form.resetFields();
      setEditingCase(null);
      setCaseModalOpen(false);
    } catch (error: unknown) {
      message.error(
        getRequestErrorMessage(
          error,
          caseModalMode === 'create' ? 'Failed to create case.' : 'Failed to update case.'
        )
      );
    } finally {
      setSubmittingCase(false);
    }
  };

  const openCreateModal = () => {
    setCaseModalMode('create');
    setEditingCase(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Draft', incidentIds: [] });
    setCaseModalOpen(true);
  };

  const openEditModal = (caseItem: ICase) => {
    setCaseModalMode('edit');
    setEditingCase(caseItem);
    form.setFieldsValue({
      title: caseItem.title,
      summary: caseItem.summary ?? undefined,
      status: caseItem.status,
      severity: caseItem.severity,
      category: caseItem.category ?? undefined,
      incidentIds: caseItem.incidentIds,
    });
    setCaseModalOpen(true);
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
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
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

            <div className={styles.drawerSection}>
              <p className={styles.drawerLabel}>Linked Incidents</p>
              {selected.incidentIds.length > 0 ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {selectedIncidentDetails.length > 0
                    ? selectedIncidentDetails.map((incident) => (
                        <div
                          key={incident.id}
                          style={{
                            border: '1px solid #dbeafe',
                            background: '#f8fbff',
                            borderRadius: 10,
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                            <strong style={{ color: '#0f172a' }}>{incident.title}</strong>
                            <Tag color="geekblue" style={{ margin: 0 }}>
                              {incident.hasImage || incident.hasAudio ? 'Media attached' : 'No media'}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 13, color: '#475569' }}>{incident.location}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                            Reported {new Date(incident.reportedAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    : selected.incidentIds.map((incidentId) => (
                        <Tag key={incidentId} color="geekblue">
                          {incidentId}
                        </Tag>
                      ))}
                </div>
              ) : (
                <p className={styles.drawerValue}>No incidents linked yet.</p>
              )}
            </div>

            <div className={styles.drawerSection}>
              <p className={styles.drawerLabel}>Evidence</p>
              {evidencePending ? (
                <Spin size="small" />
              ) : evidenceItems.length > 0 ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {evidenceItems.map((evidence: IEvidence) => (
                    <div
                      key={evidence.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        borderRadius: 10,
                        padding: '12px 14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ color: '#0f172a' }}>{evidence.fileName}</strong>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Tag color="purple" icon={<FileProtectOutlined />} style={{ margin: 0 }}>
                            {evidence.type}
                          </Tag>
                          <Tag color="blue" style={{ margin: 0 }}>
                            {evidence.status}
                          </Tag>
                          {evidence.isFlagged && (
                            <Tag color="red" style={{ margin: 0 }}>Flagged</Tag>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: 13, color: '#475569', display: 'grid', gap: 4 }}>
                        <div>
                          <strong>Source Incident:</strong>{' '}
                          {getIncidentTitle(evidence.incidentId, incidentItems) ?? 'Manual / Unknown'}
                        </div>
                        <div>
                          <strong>Uploaded:</strong> {new Date(evidence.uploadedAt).toLocaleString()}
                        </div>
                        <div>
                          <strong>Hash:</strong>{' '}
                          <code style={{ fontSize: 12 }}>
                            {evidence.fileHash ? `${evidence.fileHash.slice(0, 16)}...` : 'Unavailable'}
                          </code>
                        </div>
                        {evidence.manipulationStatus && (
                          <div>
                            <strong>Integrity Review:</strong> {evidence.manipulationStatus}
                            {typeof evidence.manipulationScore === 'number' ? ` (${evidence.manipulationScore.toFixed(2)}%)` : ''}
                          </div>
                        )}
                        {evidence.blockchainTx && (
                          <div>
                            <strong>Blockchain Ref:</strong>{' '}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <LinkOutlined />
                              {evidence.blockchainTx}
                            </span>
                          </div>
                        )}
                        {evidence.notes && <div><strong>Notes:</strong> {evidence.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.drawerValue}>No evidence has been generated for this case yet.</p>
              )}
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
              <p className={styles.drawerLabel}>Case Actions</p>
              <Button icon={<EditOutlined />} onClick={() => openEditModal(selected)}>
                Edit Case
              </Button>
            </div>

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
        open={caseModalOpen}
        title={
          <>
            <FolderAddOutlined style={{ marginRight: 8 }} />
            {caseModalMode === 'create' ? 'New Case' : 'Edit Case'}
          </>
        }
        onCancel={() => {
          setCaseModalOpen(false);
          setEditingCase(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submittingCase}
        okText={caseModalMode === 'create' ? 'Create' : 'Save Changes'}
        width={540}
      >
        <Form form={form} layout="vertical" onFinish={handleCaseSubmit} style={{ marginTop: 16 }}>
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

            <Form.Item
              name="status"
              label={caseModalMode === 'create' ? 'Initial Status' : 'Status'}
              initialValue="Draft"
            >
              <Select>
                {(caseModalMode === 'create'
                  ? PIPELINE_STAGES.filter((stage) => stage.key === 'Draft' || stage.key === 'Open')
                  : PIPELINE_STAGES
                ).map((stage) => (
                  <Select.Option key={stage.key} value={stage.key}>
                    {stage.label}
                  </Select.Option>
                ))}
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

          <Form.Item name="incidentIds" label="Link Incidents">
            <Select
              mode="multiple"
              placeholder="Select one or more incidents"
              allowClear
              optionFilterProp="label"
              options={assignableIncidents.map((incident) => ({
                value: incident.id,
                label: `${incident.title} - ${incident.location}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
