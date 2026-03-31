import { createAction } from 'redux-actions';
import { ICaseStateContext, ICase } from './context';

export enum CaseActionEnums {
  FETCH_ALL_PENDING   = 'CASE_FETCH_ALL_PENDING',
  FETCH_ALL_SUCCESS   = 'CASE_FETCH_ALL_SUCCESS',
  FETCH_ALL_ERROR     = 'CASE_FETCH_ALL_ERROR',

  FETCH_BY_ID_PENDING = 'CASE_FETCH_BY_ID_PENDING',
  FETCH_BY_ID_SUCCESS = 'CASE_FETCH_BY_ID_SUCCESS',
  FETCH_BY_ID_ERROR   = 'CASE_FETCH_BY_ID_ERROR',

  CREATE_PENDING      = 'CASE_CREATE_PENDING',
  CREATE_SUCCESS      = 'CASE_CREATE_SUCCESS',
  CREATE_ERROR        = 'CASE_CREATE_ERROR',

  UPDATE_PENDING      = 'CASE_UPDATE_PENDING',
  UPDATE_SUCCESS      = 'CASE_UPDATE_SUCCESS',
  UPDATE_ERROR        = 'CASE_UPDATE_ERROR',

  DELETE_PENDING      = 'CASE_DELETE_PENDING',
  DELETE_SUCCESS      = 'CASE_DELETE_SUCCESS',
  DELETE_ERROR        = 'CASE_DELETE_ERROR',

  TRANSITION_PENDING  = 'CASE_TRANSITION_PENDING',
  TRANSITION_SUCCESS  = 'CASE_TRANSITION_SUCCESS',
  TRANSITION_ERROR    = 'CASE_TRANSITION_ERROR',
}

export const fetchAllPending = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.FETCH_ALL_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const fetchAllSuccess = createAction<Partial<ICaseStateContext>, { items: ICase[]; totalCount: number }>(
  CaseActionEnums.FETCH_ALL_SUCCESS,
  ({ items, totalCount }) => ({ isPending: false, isSuccess: true, isError: false, items, totalCount })
);
export const fetchAllError = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.FETCH_ALL_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

export const fetchByIdPending = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.FETCH_BY_ID_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const fetchByIdSuccess = createAction<Partial<ICaseStateContext>, ICase>(
  CaseActionEnums.FETCH_BY_ID_SUCCESS,
  (selected) => ({ isPending: false, isSuccess: true, isError: false, selected })
);
export const fetchByIdError = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.FETCH_BY_ID_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

export const createPending = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.CREATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const createSuccess = createAction<Partial<ICaseStateContext>, ICase>(
  CaseActionEnums.CREATE_SUCCESS,
  (created) => ({ isPending: false, isSuccess: true, isError: false, selected: created })
);
export const createError = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.CREATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

export const updatePending = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.UPDATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const updateSuccess = createAction<Partial<ICaseStateContext>, ICase>(
  CaseActionEnums.UPDATE_SUCCESS,
  (updated) => ({ isPending: false, isSuccess: true, isError: false, selected: updated })
);
export const updateError = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.UPDATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

export const deletePending = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.DELETE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const deleteSuccess = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.DELETE_SUCCESS,
  () => ({ isPending: false, isSuccess: true, isError: false })
);
export const deleteError = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.DELETE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

export const transitionPending = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.TRANSITION_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const transitionSuccess = createAction<Partial<ICaseStateContext>, ICase>(
  CaseActionEnums.TRANSITION_SUCCESS,
  (updated) => ({ isPending: false, isSuccess: true, isError: false, selected: updated })
);
export const transitionError = createAction<Partial<ICaseStateContext>>(
  CaseActionEnums.TRANSITION_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);
