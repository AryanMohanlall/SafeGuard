import { createAction } from 'redux-actions';
import { IDispatch, IDispatchStateContext } from './context';

export enum DispatchActionEnums {
  FETCH_ALL_PENDING = 'DISPATCH_FETCH_ALL_PENDING',
  FETCH_ALL_SUCCESS = 'DISPATCH_FETCH_ALL_SUCCESS',
  FETCH_ALL_ERROR = 'DISPATCH_FETCH_ALL_ERROR',
  CREATE_PENDING = 'DISPATCH_CREATE_PENDING',
  CREATE_SUCCESS = 'DISPATCH_CREATE_SUCCESS',
  CREATE_ERROR = 'DISPATCH_CREATE_ERROR',
  TRANSITION_PENDING = 'DISPATCH_TRANSITION_PENDING',
  TRANSITION_SUCCESS = 'DISPATCH_TRANSITION_SUCCESS',
  TRANSITION_ERROR = 'DISPATCH_TRANSITION_ERROR',
}

export const fetchAllPending = createAction<Partial<IDispatchStateContext>>(
  DispatchActionEnums.FETCH_ALL_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const fetchAllSuccess = createAction<
  Partial<IDispatchStateContext>,
  { items: IDispatch[]; totalCount: number }
>(
  DispatchActionEnums.FETCH_ALL_SUCCESS,
  ({ items, totalCount }) => ({ isPending: false, isSuccess: true, isError: false, items, totalCount }),
);

export const fetchAllError = createAction<Partial<IDispatchStateContext>>(
  DispatchActionEnums.FETCH_ALL_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const createPending = createAction<Partial<IDispatchStateContext>>(
  DispatchActionEnums.CREATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const createSuccess = createAction<Partial<IDispatchStateContext>, IDispatch>(
  DispatchActionEnums.CREATE_SUCCESS,
  () => ({ isPending: false, isSuccess: true, isError: false }),
);

export const createError = createAction<Partial<IDispatchStateContext>>(
  DispatchActionEnums.CREATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const transitionPending = createAction<Partial<IDispatchStateContext>>(
  DispatchActionEnums.TRANSITION_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const transitionSuccess = createAction<Partial<IDispatchStateContext>, IDispatch>(
  DispatchActionEnums.TRANSITION_SUCCESS,
  () => ({ isPending: false, isSuccess: true, isError: false }),
);

export const transitionError = createAction<Partial<IDispatchStateContext>>(
  DispatchActionEnums.TRANSITION_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);
