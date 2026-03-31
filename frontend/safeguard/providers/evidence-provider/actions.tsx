import { createAction } from 'redux-actions';
import { IEvidence, IEvidenceStateContext } from './context';

export enum EvidenceActionEnums {
  FETCH_ALL_PENDING = 'EVIDENCE_FETCH_ALL_PENDING',
  FETCH_ALL_SUCCESS = 'EVIDENCE_FETCH_ALL_SUCCESS',
  FETCH_ALL_ERROR = 'EVIDENCE_FETCH_ALL_ERROR',

  FETCH_BY_ID_PENDING = 'EVIDENCE_FETCH_BY_ID_PENDING',
  FETCH_BY_ID_SUCCESS = 'EVIDENCE_FETCH_BY_ID_SUCCESS',
  FETCH_BY_ID_ERROR = 'EVIDENCE_FETCH_BY_ID_ERROR',
}

export const fetchAllPending = createAction<Partial<IEvidenceStateContext>>(
  EvidenceActionEnums.FETCH_ALL_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);

export const fetchAllSuccess = createAction<
  Partial<IEvidenceStateContext>,
  { items: IEvidence[]; totalCount: number }
>(
  EvidenceActionEnums.FETCH_ALL_SUCCESS,
  ({ items, totalCount }) => ({ isPending: false, isSuccess: true, isError: false, items, totalCount })
);

export const fetchAllError = createAction<Partial<IEvidenceStateContext>>(
  EvidenceActionEnums.FETCH_ALL_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

export const fetchByIdPending = createAction<Partial<IEvidenceStateContext>>(
  EvidenceActionEnums.FETCH_BY_ID_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false })
);

export const fetchByIdSuccess = createAction<Partial<IEvidenceStateContext>, IEvidence>(
  EvidenceActionEnums.FETCH_BY_ID_SUCCESS,
  (selected) => ({ isPending: false, isSuccess: true, isError: false, selected })
);

export const fetchByIdError = createAction<Partial<IEvidenceStateContext>>(
  EvidenceActionEnums.FETCH_BY_ID_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true })
);
