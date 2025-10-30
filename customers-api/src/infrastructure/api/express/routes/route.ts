import { NextFunction, Request, Response } from "express";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export const HttpMethod = {
    GET: "get" as HttpMethod,
    POST: "post" as HttpMethod,
    UPDATE: "update" as HttpMethod,
    PATCH: "patch" as HttpMethod,
    DELETE: "delete" as HttpMethod
} as const;

export type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface Route {
    getHandler(): RouteHandler | RouteHandler[];
    getPath(): string;
    getMethod(): HttpMethod;
}