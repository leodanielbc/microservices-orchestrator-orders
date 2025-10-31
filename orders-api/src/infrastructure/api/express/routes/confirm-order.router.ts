import { Response, Request } from "express";
import { validateOrderId, validateIdempotencyKey } from "../../validators/order.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ConfirmOrderUseCase } from "../../../../usecases/confirm-order/confirm-order.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class ConfirmOrderRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase
  ) {}

  public static create(confirmOrderUseCase: ConfirmOrderUseCase) {
    return new ConfirmOrderRoute(
      "/orders/:id/confirm",
      HttpMethod.POST,
      confirmOrderUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateOrderId,
        validateIdempotencyKey,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Order ID is required" });
                return;
            }
            const idempotencyKey = req.headers['x-idempotency-key'];
            if (!idempotencyKey || typeof idempotencyKey !== 'string') {
                res.status(400).json({ message: "X-Idempotency-Key header is required" });
                return;
            }

            const order = await this.confirmOrderUseCase.execute(id, idempotencyKey);
            res.status(200).json(order);
            } catch (error: any) {
            if (error.message.includes("not found")) {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message.includes("Cannot confirm")) {
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
