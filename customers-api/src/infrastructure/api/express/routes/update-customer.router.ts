import { Response, Request } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateCustomerId, validateUpdateCustomer } from "../../validators/customer.validator";
import { UpdateCustomerUseCase } from "../../../../usecases/update-customer/update-customer.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class UpdateCustomerRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase
  ) {}

  public static create(updateCustomerUseCase: UpdateCustomerUseCase) {
    return new UpdateCustomerRoute(
      "/customers/:id",
      HttpMethod.PUT,
      updateCustomerUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
      authMiddleware,
      validateCustomerId,
      validateUpdateCustomer,
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const updateData = req.body;

          const updatedCustomer = await this.updateCustomerUseCase.execute({
            id: id!,
            data: updateData
          });

          res.status(200).json({
            message: "Customer updated successfully",
            customer: {
              id: updatedCustomer.id,
              name: updatedCustomer.name,
              email: updatedCustomer.email,
              phone: updatedCustomer.phone,
              isDeleted: updatedCustomer.isDeleted,
              createdAt: updatedCustomer.createdAt,
              updatedAt: updatedCustomer.updatedAt
            }
          });
        } catch (error: any) {
          console.error("Error updating customer:", error);

          if (error.message === 'Customer not found.') {
            res.status(404).json({ message: error.message });
            return;
          }

          if (error.message === 'Email already in use by another customer.') {
            res.status(409).json({ message: error.message });
            return;
          }

          if (error.message === 'At least one field must be provided for update.') {
            res.status(400).json({ message: error.message });
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
