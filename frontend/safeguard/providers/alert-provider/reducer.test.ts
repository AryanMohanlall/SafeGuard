import { describe, expect, it } from 'vitest';
import { connectPending, connectSuccess, dismiss, newAlert } from './actions';
import { INITIAL_STATE } from './context';
import { AlertReducer } from './reducer';

describe('AlertReducer', () => {
  it('tracks connection lifecycle state', () => {
    const connecting = AlertReducer(INITIAL_STATE, connectPending());
    const connected = AlertReducer(connecting, connectSuccess());

    expect(connecting.isPending).toBe(true);
    expect(connecting.isConnected).toBe(false);
    expect(connected.isPending).toBe(false);
    expect(connected.isConnected).toBe(true);
  });

  it('prepends new alerts and exposes the latest pending item', () => {
    const first = {
      id: 'alert-1',
      title: 'First incident',
      location: 'Main Road',
      occurredAt: '2026-04-02T09:00:00Z',
      anonymous: true,
      creatorUserId: null,
    };

    const second = {
      id: 'alert-2',
      title: 'Second incident',
      location: 'Long Street',
      occurredAt: '2026-04-02T09:15:00Z',
      anonymous: false,
      creatorUserId: 12,
    };

    const afterFirst = AlertReducer(INITIAL_STATE, newAlert(first));
    const afterSecond = AlertReducer(afterFirst, newAlert(second));

    expect(afterSecond.pending).toEqual(second);
    expect(afterSecond.alerts).toEqual([second, first]);
  });

  it('dismiss clears the modal state but keeps alert history', () => {
    const withPending = AlertReducer(
      INITIAL_STATE,
      newAlert({
        id: 'alert-3',
        title: 'Dismiss me',
        location: 'Station',
        occurredAt: '2026-04-02T11:00:00Z',
        anonymous: true,
        creatorUserId: null,
      }),
    );

    const dismissed = AlertReducer(withPending, dismiss());

    expect(dismissed.pending).toBeNull();
    expect(dismissed.alerts).toHaveLength(1);
    expect(dismissed.alerts[0].title).toBe('Dismiss me');
  });
});
