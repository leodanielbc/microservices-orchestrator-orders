import { Response, Request } from "express";
import { validateCreateOrder } from "../../validators/order.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CreateOrderUseCase } from "../../../../usecases/create-order/create-order.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class CreateOrderRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly createOrderUseCase: CreateOrderUseCase
  ) {}

  public static create(createOrderUseCase: CreateOrderUseCase) {
    return new CreateOrderRoute(
      "/orders",
      HttpMethod.POST,
      createOrderUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateCreateOrder,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const input = req.body;
            const order = await this.createOrderUseCase.execute(input);
            res.status(201).json(order);
            } catch (error: any) {
            if (error.message.includes("not found") || error.message.includes("Insufficient stock")) {
                res.status(400).json({ message: error.message });
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
