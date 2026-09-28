import { Request } from 'express';
import { db } from './db.ts';

export type Session = { userId: string; expiresAt: number };
export const sessions = new Map<string, Session>();

export const getSessionUser = (req: Request) => {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader.split(';').find(value => value.trim().startsWith('agrivision_session='));
  const sessionId = cookie?.split('=').slice(1).join('=');
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice('Bearer '.length).trim()
    : undefined;
  const authenticatedSessionId = sessionId || bearerToken;
  const session = authenticatedSessionId ? sessions.get(authenticatedSessionId) : undefined;
  if (!session) return undefined;
  if (session.expiresAt < Date.now()) {
    sessions.delete(authenticatedSessionId!);
    return undefined;
  }
  return db.getUserById(session.userId);
};
