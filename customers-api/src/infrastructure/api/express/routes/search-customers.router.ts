import { Response, Request } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateSearchCustomersQuery } from "../../validators/customer.validator";
import { SearchCustomersUseCase } from "../../../../usecases/search-customers/search-customers.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class SearchCustomersRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly searchCustomersUseCase: SearchCustomersUseCase
  ) {}

  public static create(searchCustomersUseCase: SearchCustomersUseCase) {
    return new SearchCustomersRoute(
      "/customers",
      HttpMethod.GET,
      searchCustomersUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
      authMiddleware,
      validateSearchCustomersQuery,
      async (req: Request, res: Response) => {
        try {
          const { search, cursor, limit } = req.query;

          const input: any = {};

          if (search) {
            input.search = search as string;
          }

          if (cursor) {
            input.cursor = cursor as string;
          }

          if (limit) {
            input.limit = parseInt(limit as string, 10);
          }

          const result = await this.searchCustomersUseCase.execute(input);

          res.status(200).json({
            data: result.customers.map(customer => ({
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              isDeleted: customer.isDeleted,
              createdAt: customer.createdAt,
              updatedAt: customer.updatedAt
            })),
            pagination: {
              nextCursor: result.nextCursor,
              hasMore: result.hasMore,
              limit: limit ? parseInt(limit as string, 10) : 10
            }
          });
        } catch (error: any) {
          console.error("Error searching customers:", error);
          res.status(500).json({ message: "Server error" });
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
