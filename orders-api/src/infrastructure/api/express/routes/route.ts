import { Request, Response, NextFunction } from 'express';

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete'
}

export type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface Route {
    getHandler(): RouteHandler | RouteHandler[];
    getPath(): string;
    getMethod(): HttpMethod;
}
