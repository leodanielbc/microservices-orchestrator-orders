import { Response, Request } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateCustomerId } from "../../validators/customer.validator";
import { GetCustomerUseCase } from "../../../../usecases/get-customer/get-customer.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class GetCustomerRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getCustomerUseCase: GetCustomerUseCase
  ) {}

  public static create(getCustomerUseCase: GetCustomerUseCase) {
    return new GetCustomerRoute(
      "/customers/:id",
      HttpMethod.GET,
      getCustomerUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
      authMiddleware,
      validateCustomerId,
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;

          const customer = await this.getCustomerUseCase.execute(id!);

          if (!customer) {
            res.status(404).json({ message: "Customer not found." });
            return;
          }

          res.status(200).json({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            isDeleted: customer.isDeleted,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
          });
        } catch (error: any) {
          console.error("Error getting customer:", error);
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
