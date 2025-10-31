import { Response, Request } from "express";
import { validateCreateCustomer } from "../../validators/customer.validator";
import {
  authMiddleware,
} from "../../middlewares/auth.middleware";
import { CreateCustomerUseCase } from "../../../../usecases/create-customer/create-customer.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class CreateCustomerRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly createCustomerUseCase: CreateCustomerUseCase
  ) {}

  public static create(createCustomerUseCase: CreateCustomerUseCase) {
    return new CreateCustomerRoute(
      "/customers",
      HttpMethod.POST,
      createCustomerUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateCreateCustomer,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { name, email, phone } = req.body;
            const input = {
                name,
                email,
                phone,
            };
            const customer = await this.createCustomerUseCase.execute(input);
            res.status(201).json(customer);
            } catch (error: any) {
            console.error('Error creating customer:', error);
            if (error.message.includes("email already exists")) {
                res.status(409).json({ message: error.message });
                return;
            }
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
