declare namespace Express {
  export interface Request {
    user?: {
      sub: string;
      email: string;
      roles: string[];
      type: 'access';
    };
  }
}
