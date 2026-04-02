import { describe, expect, it } from 'vitest';
import { hasOfficialRole, isRestrictedPath } from './withAuth';

describe('withAuth helpers', () => {
  it('detects restricted routes', () => {
    expect(isRestrictedPath('/cases')).toBe(true);
    expect(isRestrictedPath('/cases/123')).toBe(true);
    expect(isRestrictedPath('/incident-graph')).toBe(true);
    expect(isRestrictedPath('/monitor')).toBe(true);
    expect(isRestrictedPath('/alerts')).toBe(true);
    expect(isRestrictedPath('/dashboard')).toBe(false);
  });

  it('only treats Official role names as privileged', () => {
    expect(hasOfficialRole(['Official'])).toBe(true);
    expect(hasOfficialRole(['official'])).toBe(true);
    expect(hasOfficialRole(['Citizen'])).toBe(false);
    expect(hasOfficialRole(undefined)).toBe(false);
  });
});
