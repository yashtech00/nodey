import type { UserDocument } from '../models/User'; // adjust if needed

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}