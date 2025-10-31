import { Response, Request } from "express";
import { validateSearchProductsQuery } from "../../validators/product.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { SearchProductsUseCase } from "../../../../usecases/search-products/search-products.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class SearchProductsRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly searchProductsUseCase: SearchProductsUseCase
  ) {}

  public static create(searchProductsUseCase: SearchProductsUseCase) {
    return new SearchProductsRoute(
      "/products",
      HttpMethod.GET,
      searchProductsUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateSearchProductsQuery,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { search, cursor, limit } = req.query;

            const input: any = {};
            if (search) input.search = search as string;
            if (cursor) input.cursor = cursor as string;
            if (limit) input.limit = parseInt(limit as string);

            const result = await this.searchProductsUseCase.execute(input);

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
