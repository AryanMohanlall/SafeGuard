import { describe, it, expect } from 'vitest';
import { AuthReducer } from './reducer';
import { INITIAL_STATE } from './context';
import {
  loginPending,
  loginSuccess,
  loginError,
  registerPending,
  registerSuccess,
  registerError,
  logoutPending,
  logoutSuccess,
  logoutError,
} from './actions';

const mockUser = { userId: 42, accessToken: 'tok_abc', expireInSeconds: 3600 };

describe('AuthReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = AuthReducer(INITIAL_STATE, { type: '@@UNKNOWN', payload: {} } as never);
    expect(state).toEqual(INITIAL_STATE);
  });

  // ── Login ──────────────────────────────────────────────────────
  it('LOGIN_PENDING sets isPending and clears flags', () => {
    const state = AuthReducer(INITIAL_STATE, loginPending());
    expect(state.isPending).toBe(true);
    expect(state.isSuccess).toBe(false);
    expect(state.isError).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('LOGIN_SUCCESS sets isAuthenticated and stores user', () => {
    const state = AuthReducer(INITIAL_STATE, loginSuccess(mockUser));
    expect(state.isPending).toBe(false);
    expect(state.isSuccess).toBe(true);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it('LOGIN_ERROR sets isError and clears authentication', () => {
    const prev = AuthReducer(INITIAL_STATE, loginSuccess(mockUser));
    const state = AuthReducer(prev, loginError());
    expect(state.isError).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isPending).toBe(false);
  });

  // ── Register ────────────────────────────────────────────────────
  it('REGISTER_PENDING sets isPending', () => {
    const state = AuthReducer(INITIAL_STATE, registerPending());
    expect(state.isPending).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  it('REGISTER_SUCCESS sets isAuthenticated and stores user', () => {
    const state = AuthReducer(INITIAL_STATE, registerSuccess(mockUser));
    expect(state.isSuccess).toBe(true);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it('REGISTER_ERROR sets isError', () => {
    const state = AuthReducer(INITIAL_STATE, registerError());
    expect(state.isError).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  // ── Logout ──────────────────────────────────────────────────────
  it('LOGOUT_PENDING sets isPending', () => {
    const authenticated = AuthReducer(INITIAL_STATE, loginSuccess(mockUser));
    const state = AuthReducer(authenticated, logoutPending());
    expect(state.isPending).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  it('LOGOUT_SUCCESS clears all auth state and removes user', () => {
    const authenticated = AuthReducer(INITIAL_STATE, loginSuccess(mockUser));
    const state = AuthReducer(authenticated, logoutSuccess());
    expect(state.isPending).toBe(false);
    expect(state.isSuccess).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeUndefined();
  });

  it('LOGOUT_ERROR sets isError', () => {
    const authenticated = AuthReducer(INITIAL_STATE, loginSuccess(mockUser));
    const state = AuthReducer(authenticated, logoutError());
    expect(state.isError).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  // ── State immutability ──────────────────────────────────────────
  it('does not mutate the previous state', () => {
    const before = { ...INITIAL_STATE };
    AuthReducer(INITIAL_STATE, loginPending());
    expect(INITIAL_STATE).toEqual(before);
  });
});
