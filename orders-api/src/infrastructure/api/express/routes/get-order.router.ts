import { Response, Request } from "express";
import { validateOrderId } from "../../validators/order.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { GetOrderUseCase } from "../../../../usecases/get-order/get-order.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class GetOrderRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getOrderUseCase: GetOrderUseCase
  ) {}

  public static create(getOrderUseCase: GetOrderUseCase) {
    return new GetOrderRoute(
      "/orders/:id",
      HttpMethod.GET,
      getOrderUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateOrderId,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Order ID is required" });
                return;
            }
            const order = await this.getOrderUseCase.execute(id);

            if (!order) {
                res.status(404).json({ message: "Order not found" });
                return;
            }

            res.status(200).json(order);
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
