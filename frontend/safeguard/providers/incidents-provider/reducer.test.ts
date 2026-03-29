import { describe, it, expect } from 'vitest';
import { IncidentReducer } from './reducer';
import { INITIAL_STATE } from './context';
import {
  fetchAllPending,
  fetchAllSuccess,
  fetchAllError,
  fetchByIdPending,
  fetchByIdSuccess,
  fetchByIdError,
  createPending,
  createSuccess,
  createError,
  updatePending,
  updateSuccess,
  updateError,
  deletePending,
  deleteSuccess,
  deleteError,
} from './actions';
import type { IIncident } from './context';

const mockIncident: IIncident = {
  id: 'inc-001',
  title: 'Test Incident',
  description: 'A test description',
  location: '123 Main St',
  hasAudio: false,
  audioFileName: null,
  audioContentType: null,
  hasImage: false,
  imageFileName: null,
  imageContentType: null,
  latitude: null,
  longitude: null,
  anonymous: false,
  occurredAt: '2026-03-01T10:00:00Z',
  reportedAt: '2026-03-01T10:05:00Z',
  creationTime: '2026-03-01T10:05:00Z',
  creatorUserId: 1,
  detectedObjects: null,
};

const mockIncident2: IIncident = { ...mockIncident, id: 'inc-002', title: 'Second Incident' };

describe('IncidentReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = IncidentReducer(INITIAL_STATE, { type: '@@UNKNOWN', payload: {} } as never);
    expect(state).toEqual(INITIAL_STATE);
  });

  // ── Fetch all ──────────────────────────────────────────────────
  it('FETCH_ALL_PENDING sets isPending and clears flags', () => {
    const state = IncidentReducer(INITIAL_STATE, fetchAllPending());
    expect(state.isPending).toBe(true);
    expect(state.isSuccess).toBe(false);
    expect(state.isError).toBe(false);
  });

  it('FETCH_ALL_SUCCESS stores items and totalCount', () => {
    const items = [mockIncident, mockIncident2];
    const state = IncidentReducer(INITIAL_STATE, fetchAllSuccess({ items, totalCount: 2 }));
    expect(state.isPending).toBe(false);
    expect(state.isSuccess).toBe(true);
    expect(state.items).toHaveLength(2);
    expect(state.totalCount).toBe(2);
    expect(state.items[0].id).toBe('inc-001');
  });

  it('FETCH_ALL_ERROR sets isError', () => {
    const prev = IncidentReducer(INITIAL_STATE, fetchAllPending());
    const state = IncidentReducer(prev, fetchAllError());
    expect(state.isError).toBe(true);
    expect(state.isPending).toBe(false);
  });

  // ── Fetch by ID ────────────────────────────────────────────────
  it('FETCH_BY_ID_PENDING sets isPending', () => {
    const state = IncidentReducer(INITIAL_STATE, fetchByIdPending());
    expect(state.isPending).toBe(true);
  });

  it('FETCH_BY_ID_SUCCESS sets selected incident', () => {
    const state = IncidentReducer(INITIAL_STATE, fetchByIdSuccess(mockIncident));
    expect(state.isSuccess).toBe(true);
    expect(state.selected).toEqual(mockIncident);
  });

  it('FETCH_BY_ID_ERROR sets isError', () => {
    const state = IncidentReducer(INITIAL_STATE, fetchByIdError());
    expect(state.isError).toBe(true);
    expect(state.isPending).toBe(false);
  });

  // ── Create ─────────────────────────────────────────────────────
  it('CREATE_PENDING sets isPending', () => {
    const state = IncidentReducer(INITIAL_STATE, createPending());
    expect(state.isPending).toBe(true);
  });

  it('CREATE_SUCCESS sets selected to newly created incident', () => {
    const state = IncidentReducer(INITIAL_STATE, createSuccess(mockIncident));
    expect(state.isSuccess).toBe(true);
    expect(state.selected).toEqual(mockIncident);
  });

  it('CREATE_ERROR sets isError', () => {
    const state = IncidentReducer(INITIAL_STATE, createError());
    expect(state.isError).toBe(true);
  });

  // ── Update ─────────────────────────────────────────────────────
  it('UPDATE_PENDING sets isPending', () => {
    const state = IncidentReducer(INITIAL_STATE, updatePending());
    expect(state.isPending).toBe(true);
  });

  it('UPDATE_SUCCESS sets selected to updated incident', () => {
    const updated = { ...mockIncident, title: 'Updated Title' };
    const state = IncidentReducer(INITIAL_STATE, updateSuccess(updated));
    expect(state.isSuccess).toBe(true);
    expect(state.selected?.title).toBe('Updated Title');
  });

  it('UPDATE_ERROR sets isError', () => {
    const state = IncidentReducer(INITIAL_STATE, updateError());
    expect(state.isError).toBe(true);
  });

  // ── Delete ─────────────────────────────────────────────────────
  it('DELETE_PENDING sets isPending', () => {
    const state = IncidentReducer(INITIAL_STATE, deletePending());
    expect(state.isPending).toBe(true);
  });

  it('DELETE_SUCCESS sets isSuccess', () => {
    const state = IncidentReducer(INITIAL_STATE, deleteSuccess());
    expect(state.isSuccess).toBe(true);
    expect(state.isPending).toBe(false);
  });

  it('DELETE_ERROR sets isError', () => {
    const state = IncidentReducer(INITIAL_STATE, deleteError());
    expect(state.isError).toBe(true);
  });

  // ── State immutability ─────────────────────────────────────────
  it('does not mutate previous state', () => {
    IncidentReducer(INITIAL_STATE, fetchAllSuccess({ items: [mockIncident], totalCount: 1 }));
    expect(INITIAL_STATE.items).toHaveLength(0);
  });

  // ── Sequential state transitions ──────────────────────────────
  it('transitions from pending → success correctly', () => {
    let state = IncidentReducer(INITIAL_STATE, fetchAllPending());
    expect(state.isPending).toBe(true);

    state = IncidentReducer(state, fetchAllSuccess({ items: [mockIncident], totalCount: 1 }));
    expect(state.isPending).toBe(false);
    expect(state.isSuccess).toBe(true);
    expect(state.items).toHaveLength(1);
  });
});
