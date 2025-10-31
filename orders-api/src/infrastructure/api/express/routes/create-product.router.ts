import { Response, Request } from "express";
import { validateCreateProduct } from "../../validators/product.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CreateProductUseCase } from "../../../../usecases/create-product/create-product.usecase";
import { HttpMethod, Route, RouteHandler } from "./route";

export class CreateProductRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly createProductUseCase: CreateProductUseCase
  ) {}

  public static create(createProductUseCase: CreateProductUseCase) {
    return new CreateProductRoute(
      "/products",
      HttpMethod.POST,
      createProductUseCase
    );
  }

  public getHandler(): RouteHandler[] {
    return [
        validateCreateProduct,
        authMiddleware,
        async (req: Request, res: Response) => {
            try {
            const { sku, name, priceCents, stock } = req.body;
            const input = {
                sku,
                name,
                priceCents,
                stock,
            };
            const product = await this.createProductUseCase.execute(input);
            res.status(201).json(product);
            } catch (error: any) {
            if (error.message.includes("SKU already exists")) {
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
