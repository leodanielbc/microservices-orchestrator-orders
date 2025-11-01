import { Response, Request } from "express";
import { HttpMethod, Route, RouteHandler } from "./route";

export class HealthCheckRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod
  ) {}

  public static create() {
    return new HealthCheckRoute(
      "/health",
      HttpMethod.GET
    );
  }

  
  public getHandler(): RouteHandler[] {
    return [
      async (req: Request, res: Response) => {
        try {
          res.status(200).json({
            status: "UP",
            service: "orders-api",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          res.status(503).json({
            status: "DOWN",
            service: "orders-api",
            error: "Health check failed unexpectedly",
          });
        }
      },
    ];
  }

  public getPath(): string {
    return this.path;
  }

  public getMethod(): HttpMethod {
    return this.method;
  }
}