import { Request } from 'express';

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  authHeader.split(' ')[1];
  return authHeader.split(' ')[1];
}
