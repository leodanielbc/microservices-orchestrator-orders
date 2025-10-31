import { Response, Request } from "express";
import { validateOrderId } from "../../validators/order.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CancelOrderUseCase } from "../../../../usecases/cancel-order/cancel-order.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class CancelOrderRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly cancelOrderUseCase: CancelOrderUseCase
  ) {}

  public static create(cancelOrderUseCase: CancelOrderUseCase) {
    return new CancelOrderRoute(
      "/orders/:id/cancel",
      HttpMethod.POST,
      cancelOrderUseCase
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
            const order = await this.cancelOrderUseCase.execute(id);
            res.status(200).json(order);
            } catch (error: any) {
            if (error.message.includes("not found")) {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message.includes("Cannot cancel") || error.message.includes("already canceled")) {
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
