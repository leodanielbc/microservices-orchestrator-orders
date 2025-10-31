import { Response, Request } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateCustomerId } from "../../validators/customer.validator";
import { DeleteCustomerUseCase } from "../../../../usecases/delete-customer/delete-customer.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class DeleteCustomerRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase
  ) {}

  public static create(deleteCustomerUseCase: DeleteCustomerUseCase) {
    return new DeleteCustomerRoute(
      "/customers/:id",
      HttpMethod.DELETE,
      deleteCustomerUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
      authMiddleware,
      validateCustomerId,
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;

          await this.deleteCustomerUseCase.execute(id!);

          res.status(200).json({
            message: "Customer deleted successfully"
          });
        } catch (error: any) {
          console.error("Error deleting customer:", error);

          if (error.message === 'Customer not found.') {
            res.status(404).json({ message: error.message });
            return;
          }

          if (error.message === 'Customer could not be deleted.') {
            res.status(500).json({ message: error.message });
            return;
          }

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
