declare global {
  namespace Express {
    interface Request {
      apiVersion?: string;
      user?: {
        id: number;
        roles: string[];
        sid?: string;
      };
    }
  }
}

export {};
