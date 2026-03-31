import { describe, it, expect } from 'vitest';
import {
  IncidentActionEnums,
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
  title: 'Burglary',
  description: 'Burglary at downtown store',
  location: '456 Commerce Ave',
  hasAudio: false,
  audioFileName: null,
  audioContentType: null,
  hasImage: true,
  imageFileName: 'scene.jpg',
  imageContentType: 'image/jpeg',
  latitude: 40.712776,
  longitude: -74.005974,
  caseId: null,
  anonymous: true,
  occurredAt: '2026-03-15T08:00:00Z',
  reportedAt: '2026-03-15T08:30:00Z',
  creationTime: '2026-03-15T08:30:00Z',
  creatorUserId: null,
  detectedObjects: '["person","bag"]',
};

describe('Incident action creators', () => {
  // ── Fetch all ────────────────────────────────────────────────
  it('fetchAllPending has correct type', () => {
    expect(fetchAllPending().type).toBe(IncidentActionEnums.FETCH_ALL_PENDING);
  });

  it('fetchAllPending payload sets isPending=true', () => {
    const { payload } = fetchAllPending();
    expect(payload.isPending).toBe(true);
    expect(payload.isSuccess).toBe(false);
    expect(payload.isError).toBe(false);
  });

  it('fetchAllSuccess has correct type', () => {
    expect(fetchAllSuccess({ items: [], totalCount: 0 }).type).toBe(IncidentActionEnums.FETCH_ALL_SUCCESS);
  });

  it('fetchAllSuccess payload includes items and totalCount', () => {
    const { payload } = fetchAllSuccess({ items: [mockIncident], totalCount: 1 });
    expect(payload.isSuccess).toBe(true);
    expect(payload.items).toHaveLength(1);
    expect(payload.totalCount).toBe(1);
  });

  it('fetchAllError has correct type', () => {
    expect(fetchAllError().type).toBe(IncidentActionEnums.FETCH_ALL_ERROR);
  });

  it('fetchAllError payload sets isError=true', () => {
    expect(fetchAllError().payload.isError).toBe(true);
  });

  // ── Fetch by ID ──────────────────────────────────────────────
  it('fetchByIdPending has correct type', () => {
    expect(fetchByIdPending().type).toBe(IncidentActionEnums.FETCH_BY_ID_PENDING);
  });

  it('fetchByIdSuccess has correct type', () => {
    expect(fetchByIdSuccess(mockIncident).type).toBe(IncidentActionEnums.FETCH_BY_ID_SUCCESS);
  });

  it('fetchByIdSuccess payload contains selected incident', () => {
    const { payload } = fetchByIdSuccess(mockIncident);
    expect(payload.selected).toEqual(mockIncident);
    expect(payload.isSuccess).toBe(true);
  });

  it('fetchByIdError has correct type', () => {
    expect(fetchByIdError().type).toBe(IncidentActionEnums.FETCH_BY_ID_ERROR);
  });

  // ── Create ───────────────────────────────────────────────────
  it('createPending has correct type', () => {
    expect(createPending().type).toBe(IncidentActionEnums.CREATE_PENDING);
  });

  it('createSuccess has correct type', () => {
    expect(createSuccess(mockIncident).type).toBe(IncidentActionEnums.CREATE_SUCCESS);
  });

  it('createSuccess payload contains created incident as selected', () => {
    const { payload } = createSuccess(mockIncident);
    expect(payload.selected).toEqual(mockIncident);
    expect(payload.isSuccess).toBe(true);
  });

  it('createError has correct type', () => {
    expect(createError().type).toBe(IncidentActionEnums.CREATE_ERROR);
  });

  // ── Update ───────────────────────────────────────────────────
  it('updatePending has correct type', () => {
    expect(updatePending().type).toBe(IncidentActionEnums.UPDATE_PENDING);
  });

  it('updateSuccess has correct type', () => {
    expect(updateSuccess(mockIncident).type).toBe(IncidentActionEnums.UPDATE_SUCCESS);
  });

  it('updateSuccess payload contains updated incident as selected', () => {
    const updated = { ...mockIncident, title: 'Updated Burglary Report' };
    const { payload } = updateSuccess(updated);
    expect(payload.selected?.title).toBe('Updated Burglary Report');
  });

  it('updateError has correct type', () => {
    expect(updateError().type).toBe(IncidentActionEnums.UPDATE_ERROR);
  });

  // ── Delete ───────────────────────────────────────────────────
  it('deletePending has correct type', () => {
    expect(deletePending().type).toBe(IncidentActionEnums.DELETE_PENDING);
  });

  it('deleteSuccess has correct type', () => {
    expect(deleteSuccess().type).toBe(IncidentActionEnums.DELETE_SUCCESS);
  });

  it('deleteSuccess payload sets isSuccess=true', () => {
    const { payload } = deleteSuccess();
    expect(payload.isSuccess).toBe(true);
    expect(payload.isPending).toBe(false);
  });

  it('deleteError has correct type', () => {
    expect(deleteError().type).toBe(IncidentActionEnums.DELETE_ERROR);
  });

  it('deleteError payload sets isError=true', () => {
    expect(deleteError().payload.isError).toBe(true);
  });
});
