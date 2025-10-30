import { Express } from "express";
export interface Api {
    start(port:number): void;
    getApp(): Express;
}