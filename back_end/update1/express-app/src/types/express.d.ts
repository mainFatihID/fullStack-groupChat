import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            NODE_ENV?: 'development' | 'production' | 'test';
        }
    }
}

export {};