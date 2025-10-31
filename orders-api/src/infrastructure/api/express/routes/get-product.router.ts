import { Response, Request } from "express";
import { validateProductId } from "../../validators/product.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { GetProductUseCase } from "../../../../usecases/get-product/get-product.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class GetProductRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getProductUseCase: GetProductUseCase
  ) {}

  public static create(getProductUseCase: GetProductUseCase) {
    return new GetProductRoute(
      "/products/:id",
      HttpMethod.GET,
      getProductUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateProductId,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Product ID is required" });
                return;
            }
            const product = await this.getProductUseCase.execute(id);

            if (!product) {
                res.status(404).json({ message: "Product not found" });
                return;
            }

            res.status(200).json(product);
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
