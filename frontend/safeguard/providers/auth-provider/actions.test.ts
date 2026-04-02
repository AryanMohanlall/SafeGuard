import { describe, it, expect } from 'vitest';
import {
  AuthStateEnums,
  sessionPending,
  sessionSuccess,
  sessionError,
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

const mockUser = { userId: 7, accessToken: 'tok_xyz', expireInSeconds: 7200, roleNames: ['Official'] };

describe('Auth action creators', () => {
  it('sessionPending has correct type', () => {
    expect(sessionPending().type).toBe(AuthStateEnums.SESSION_PENDING);
  });

  it('sessionSuccess payload marks auth as ready and authenticated', () => {
    const { payload } = sessionSuccess(mockUser);
    expect(payload.isReady).toBe(true);
    expect(payload.isAuthenticated).toBe(true);
    expect(payload.user).toEqual(mockUser);
  });

  it('sessionError payload marks auth as ready without a user', () => {
    const { payload } = sessionError();
    expect(payload.isReady).toBe(true);
    expect(payload.isAuthenticated).toBe(false);
    expect(payload.user).toBeUndefined();
  });

  // ── loginPending ─────────────────────────────────────────────
  it('loginPending has correct type', () => {
    expect(loginPending().type).toBe(AuthStateEnums.LOGIN_PENDING);
  });

  it('loginPending payload marks isPending=true', () => {
    const { payload } = loginPending();
    expect(payload.isPending).toBe(true);
    expect(payload.isAuthenticated).toBe(false);
    expect(payload.isSuccess).toBe(false);
    expect(payload.isError).toBe(false);
  });

  // ── loginSuccess ─────────────────────────────────────────────
  it('loginSuccess has correct type', () => {
    expect(loginSuccess(mockUser).type).toBe(AuthStateEnums.LOGIN_SUCCESS);
  });

  it('loginSuccess payload includes user and sets isAuthenticated=true', () => {
    const { payload } = loginSuccess(mockUser);
    expect(payload.isAuthenticated).toBe(true);
    expect(payload.isSuccess).toBe(true);
    expect(payload.isPending).toBe(false);
    expect(payload.user).toEqual(mockUser);
  });

  // ── loginError ───────────────────────────────────────────────
  it('loginError has correct type', () => {
    expect(loginError().type).toBe(AuthStateEnums.LOGIN_ERROR);
  });

  it('loginError payload sets isError=true', () => {
    const { payload } = loginError();
    expect(payload.isError).toBe(true);
    expect(payload.isAuthenticated).toBe(false);
    expect(payload.isPending).toBe(false);
  });

  // ── registerPending ──────────────────────────────────────────
  it('registerPending has correct type', () => {
    expect(registerPending().type).toBe(AuthStateEnums.REGISTER_PENDING);
  });

  it('registerPending payload sets isPending=true', () => {
    expect(registerPending().payload.isPending).toBe(true);
  });

  // ── registerSuccess ──────────────────────────────────────────
  it('registerSuccess has correct type', () => {
    expect(registerSuccess(mockUser).type).toBe(AuthStateEnums.REGISTER_SUCCESS);
  });

  it('registerSuccess payload includes user', () => {
    const { payload } = registerSuccess(mockUser);
    expect(payload.isAuthenticated).toBe(true);
    expect(payload.user).toEqual(mockUser);
  });

  // ── registerError ────────────────────────────────────────────
  it('registerError has correct type', () => {
    expect(registerError().type).toBe(AuthStateEnums.REGISTER_ERROR);
  });

  it('registerError payload sets isError=true', () => {
    expect(registerError().payload.isError).toBe(true);
  });

  // ── logoutPending ────────────────────────────────────────────
  it('logoutPending has correct type', () => {
    expect(logoutPending().type).toBe(AuthStateEnums.LOGOUT_PENDING);
  });

  it('logoutPending payload sets isPending=true', () => {
    expect(logoutPending().payload.isPending).toBe(true);
  });

  // ── logoutSuccess ────────────────────────────────────────────
  it('logoutSuccess has correct type', () => {
    expect(logoutSuccess().type).toBe(AuthStateEnums.LOGOUT_SUCCESS);
  });

  it('logoutSuccess payload clears auth and user', () => {
    const { payload } = logoutSuccess();
    expect(payload.isAuthenticated).toBe(false);
    expect(payload.user).toBeUndefined();
    expect(payload.isSuccess).toBe(false);
  });

  // ── logoutError ──────────────────────────────────────────────
  it('logoutError has correct type', () => {
    expect(logoutError().type).toBe(AuthStateEnums.LOGOUT_ERROR);
  });

  it('logoutError payload sets isError=true', () => {
    expect(logoutError().payload.isError).toBe(true);
  });
});
