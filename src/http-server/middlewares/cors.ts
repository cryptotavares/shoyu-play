import cors from 'cors';

export const corsMiddleware = cors({
  credentials: true,
  maxAge: 86400,
});
