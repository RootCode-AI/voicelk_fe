import test from 'node:test';
import assert from 'node:assert/strict';
import { TOKEN_KEY, USER_KEY, ACTIVE_NAV_KEY, clearSession, getSessionRevision, isCurrentSession, expireSession, SESSION_EXPIRED_EVENT } from './session.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};

test('logout removes session data and navigation while preserving unrelated preferences', () => {
  const old = Object.getOwnPropertyDescriptors(globalThis);
  const local = memoryStorage();
  const session = memoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: local, configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: session, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: new EventTarget(), configurable: true });
  try {
    local.setItem(TOKEN_KEY, 'account-a-token');
    local.setItem(USER_KEY, '{"userId":"account-a"}');
    local.setItem('unrelated-preference', 'keep');
    session.setItem(ACTIVE_NAV_KEY, 'chat');
    const revision = getSessionRevision();
    assert.equal(isCurrentSession('account-a-token', revision), true);
    clearSession();
    assert.equal(local.getItem(TOKEN_KEY), null);
    assert.equal(local.getItem(USER_KEY), null);
    assert.equal(session.getItem(ACTIVE_NAV_KEY), null);
    assert.equal(local.getItem('unrelated-preference'), 'keep');
    assert.equal(isCurrentSession('account-a-token', revision), false);
    // Even logging back in with the same token cannot revive a previous request.
    local.setItem(TOKEN_KEY, 'account-a-token');
    assert.equal(isCurrentSession('account-a-token', revision), false);
    assert.equal(isCurrentSession('account-a-token', getSessionRevision()), true);
    local.setItem(TOKEN_KEY, 'account-b-token');
    assert.equal(isCurrentSession('account-a-token', getSessionRevision()), false);
    let expired = 0;
    window.addEventListener(SESSION_EXPIRED_EVENT, () => { expired += 1; });
    expireSession();
    expireSession();
    assert.equal(expired, 1);
    assert.equal(local.getItem(TOKEN_KEY), null);
  } finally {
    for (const key of ['localStorage', 'sessionStorage', 'window']) {
      if (old[key]) Object.defineProperty(globalThis, key, old[key]);
      else delete globalThis[key];
    }
  }
});
