import 'express-session';

declare module 'express-session' {
  interface SessionData {
    domainId: number;
  }
}

export { };
