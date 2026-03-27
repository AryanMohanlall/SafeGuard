import { createAction } from 'redux-actions';
import { IIncidentStateContext, IIncident } from './context';

export enum IncidentActionEnums {
  FETCH_ALL_PENDING   = 'INCIDENT_FETCH_ALL_PENDING',
  FETCH_ALL_SUCCESS   = 'INCIDENT_FETCH_ALL_SUCCESS',
  FETCH_ALL_ERROR     = 'INCIDENT_FETCH_ALL_ERROR',

  FETCH_BY_ID_PENDING = 'INCIDENT_FETCH_BY_ID_PENDING',
  FETCH_BY_ID_SUCCESS = 'INCIDENT_FETCH_BY_ID_SUCCESS',
  FETCH_BY_ID_ERROR   = 'INCIDENT_FETCH_BY_ID_ERROR',

  CREATE_PENDING      = 'INCIDENT_CREATE_PENDING',
  CREATE_SUCCESS      = 'INCIDENT_CREATE_SUCCESS',
  CREATE_ERROR        = 'INCIDENT_CREATE_ERROR',

  UPDATE_PENDING      = 'INCIDENT_UPDATE_PENDING',
  UPDATE_SUCCESS      = 'INCIDENT_UPDATE_SUCCESS',
  UPDATE_ERROR        = 'INCIDENT_UPDATE_ERROR',

  DELETE_PENDING      = 'INCIDENT_DELETE_PENDING',
  DELETE_SUCCESS      = 'INCIDENT_DELETE_SUCCESS',
  DELETE_ERROR        = 'INCIDENT_DELETE_ERROR',
}

// ── Fetch all ────────────────────────────────────────────────
export const fetchAllPending = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.FETCH_ALL_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const fetchAllSuccess = createAction<
  Partial<IIncidentStateContext>,
  { items: IIncident[]; totalCount: number }
>(
  IncidentActionEnums.FETCH_ALL_SUCCESS,
  ({ items, totalCount }) => ({
    isPending: false, isSuccess: true, isError: false, items, totalCount,
  })
);
export const fetchAllError = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.FETCH_ALL_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

// ── Fetch by ID ──────────────────────────────────────────────
export const fetchByIdPending = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.FETCH_BY_ID_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const fetchByIdSuccess = createAction<Partial<IIncidentStateContext>, IIncident>(
  IncidentActionEnums.FETCH_BY_ID_SUCCESS,
  (selected) => ({ isPending: false, isSuccess: true, isError: false, selected })
);
export const fetchByIdError = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.FETCH_BY_ID_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

// ── Create ───────────────────────────────────────────────────
export const createPending = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.CREATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const createSuccess = createAction<Partial<IIncidentStateContext>, IIncident>(
  IncidentActionEnums.CREATE_SUCCESS,
  (created) => ({ isPending: false, isSuccess: true, isError: false, selected: created })
);
export const createError = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.CREATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

// ── Update ───────────────────────────────────────────────────
export const updatePending = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.UPDATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const updateSuccess = createAction<Partial<IIncidentStateContext>, IIncident>(
  IncidentActionEnums.UPDATE_SUCCESS,
  (updated) => ({ isPending: false, isSuccess: true, isError: false, selected: updated })
);
export const updateError = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.UPDATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

// ── Delete ───────────────────────────────────────────────────
export const deletePending = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.DELETE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const deleteSuccess = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.DELETE_SUCCESS,
  () => ({ isPending: false, isSuccess: true, isError: false })
);
export const deleteError = createAction<Partial<IIncidentStateContext>>(
  IncidentActionEnums.DELETE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);
