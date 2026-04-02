import { describe, expect, it } from 'vitest';
import {
  AlertStateEnums,
  connectError,
  connectPending,
  connectSuccess,
  dismiss,
  newAlert,
} from './actions';
import type { IncidentAlert } from './context';

const mockAlert: IncidentAlert = {
  id: 'alert-001',
  creatorUserId: 7,
  title: 'Suspicious activity',
  location: '42 Market Street',
  occurredAt: '2026-04-02T10:30:00Z',
  anonymous: false,
};

describe('alert action creators', () => {
  it('connectPending marks the alert channel as connecting', () => {
    const action = connectPending();

    expect(action.type).toBe(AlertStateEnums.CONNECT_PENDING);
    expect(action.payload).toEqual({ isPending: true, isConnected: false });
  });

  it('connectSuccess marks the alert channel as connected', () => {
    const action = connectSuccess();

    expect(action.type).toBe(AlertStateEnums.CONNECT_SUCCESS);
    expect(action.payload).toEqual({ isPending: false, isConnected: true });
  });

  it('connectError clears the pending connection state', () => {
    const action = connectError();

    expect(action.type).toBe(AlertStateEnums.CONNECT_ERROR);
    expect(action.payload).toEqual({ isPending: false, isConnected: false });
  });

  it('newAlert stores the incoming alert as pending', () => {
    const action = newAlert(mockAlert);

    expect(action.type).toBe(AlertStateEnums.NEW_ALERT);
    expect(action.payload).toEqual({ isPending: false, pending: mockAlert });
  });

  it('dismiss clears the pending alert only', () => {
    const action = dismiss();

    expect(action.type).toBe(AlertStateEnums.DISMISS);
    expect(action.payload).toEqual({ pending: null });
  });
});
