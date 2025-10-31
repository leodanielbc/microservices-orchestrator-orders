import { Response, Request } from "express";
import { validateProductId, validateUpdateProduct } from "../../validators/product.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { UpdateProductUseCase } from "../../../../usecases/update-product/update-product.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class UpdateProductRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly updateProductUseCase: UpdateProductUseCase
  ) {}

  public static create(updateProductUseCase: UpdateProductUseCase) {
    return new UpdateProductRoute(
      "/products/:id",
      HttpMethod.PATCH,
      updateProductUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateProductId,
        validateUpdateProduct,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Product ID is required" });
                return;
            }
            const updateData = req.body;

            const product = await this.updateProductUseCase.execute(id, updateData);
            res.status(200).json(product);
            } catch (error: any) {
            if (error.message.includes("not found")) {
                res.status(404).json({ message: error.message });
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
