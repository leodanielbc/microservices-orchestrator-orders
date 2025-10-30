import { Response, Request } from "express";
import { serviceAuthMiddleware } from "../../middlewares/service-auth.middleware";
import { GetInternalCustomerUseCase } from "../../../../usecases/get-internal-customer/get-internal-customer.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class GetInternalCustomerRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getInternalCustomerUseCase: GetInternalCustomerUseCase
  ) {}

  public static create(getInternalCustomerUseCase: GetInternalCustomerUseCase) {
    return new GetInternalCustomerRoute(
      "/internal/customers/:id",
      HttpMethod.GET,
      getInternalCustomerUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
      serviceAuthMiddleware,
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;

          if (!id) {
            res.status(400).json({ message: "Customer ID is required." });
            return;
          }

          const customer = await this.getInternalCustomerUseCase.execute(id);

          if (!customer) {
            res.status(404).json({ message: "Customer not found." });
            return;
          }

          res.status(200).json(customer);
        } catch (error: any) {
          console.error("Error getting internal customer:", error);
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
