import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseService } from '../server/db.ts';

const tempDbPath = 'dataset/test-persistence.sqlite';

test('database service initializes sqlite-backed persistence and persists records', async () => {
  const db = new DatabaseService({ dbPath: tempDbPath });

  const seedUser = db.getUserByEmail('ramesh.farmer@agrivision.in');
  assert.ok(seedUser, 'seed user should exist after sqlite bootstrap');

  const before = db.getAllUsers().length;
  db.registerUser({
    name: 'Test Farmer',
    email: 'test.farmer@agrivision.in',
    phone: '+91 90000 00000',
    role: 'FARMER',
    language: 'en',
    passwordHash: 'demo-hash',
    status: 'ACTIVE',
  });

  const after = db.getAllUsers().length;
  assert.equal(after, before + 1, 'user should be inserted into persistent storage');

  const persisted = new DatabaseService({ dbPath: tempDbPath });
  assert.ok(persisted.getUserByEmail('test.farmer@agrivision.in'), 'record should survive a reopened database connection');
  persisted.resetToSeedData();
});
