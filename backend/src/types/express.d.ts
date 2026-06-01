import type { RoleName } from "./domain";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: RoleName;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
