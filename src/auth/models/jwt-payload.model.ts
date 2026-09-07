export interface JwtPayload {
  userId: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
