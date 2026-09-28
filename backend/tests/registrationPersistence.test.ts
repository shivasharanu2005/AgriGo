import test from 'node:test';
import assert from 'node:assert/strict';
import {
  persistRegistrationSuccess,
  readRegistrationSuccess,
  clearRegistrationSuccess,
} from '../../frontend/src/lib/registrationStorage.ts';

test('registration success data is persisted and can be read back', () => {
  const user = { id: 'usr_101', name: 'Ananya Sharma', email: 'ananya@example.com' };

  clearRegistrationSuccess();
  persistRegistrationSuccess(user);

  const stored = readRegistrationSuccess();

  assert.ok(stored, 'registration success data should be stored');
  assert.equal(stored?.name, 'Ananya Sharma');
  assert.equal(stored?.email, 'ananya@example.com');
  assert.equal(stored?.signedIn, true);

  clearRegistrationSuccess();
  assert.equal(readRegistrationSuccess(), null);
});
