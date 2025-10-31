import { Response, Request } from "express";
import { validateSearchOrdersQuery } from "../../validators/order.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { SearchOrdersUseCase } from "../../../../usecases/search-orders/search-orders.usecase";
import { OrderStatus } from "../../../../domain/order/entity/order";
import { HttpMethod, Route, RouteHandler } from "./route";

export class SearchOrdersRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly searchOrdersUseCase: SearchOrdersUseCase
  ) {}

  public static create(searchOrdersUseCase: SearchOrdersUseCase) {
    return new SearchOrdersRoute(
      "/orders",
      HttpMethod.GET,
      searchOrdersUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateSearchOrdersQuery,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { status, from, to, cursor, limit } = req.query;

            const input: any = {};
            if (status) input.status = status as OrderStatus;
            if (from) input.from = from as string;
            if (to) input.to = to as string;
            if (cursor) input.cursor = cursor as string;
            if (limit) input.limit = parseInt(limit as string);

            const result = await this.searchOrdersUseCase.execute(input);

            res.status(200).json(result);
            } catch (error: any) {
            res.status(500).json({ message: "Server error", error: error.message });
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
