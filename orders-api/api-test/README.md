# API Tests - Orders API

Colección de archivos HTTP para probar todos los endpoints de la Orders API.

## Archivos de Prueba

### 1. `products.http`
Pruebas para endpoints de productos:
- Crear producto (POST /products)
- Obtener producto por ID (GET /products/:id)
- Actualizar producto (PATCH /products/:id)
- Buscar productos (GET /products)
- Casos de error: SKU duplicado, validaciones, no encontrado


### 2. `orders.http`
Pruebas para endpoints de órdenes:
- Crear orden (POST /orders)
- Obtener orden por ID (GET /orders/:id)
- Buscar órdenes (GET /orders)
- Confirmar orden (POST /orders/:id/confirm)
- Cancelar orden (POST /orders/:id/cancel)
- Filtros por estado, fechas
- Paginación con cursor
- Idempotencia en confirmación
- Casos de error: cliente no existe, stock insuficiente, validaciones


### 3. `integration-flow.http`
Flujo completo de integración que simula un caso de negocio real:
- **Flujo 1:** Crear productos para inventario
- **Flujo 2:** Crear y gestionar órdenes
- **Flujo 3:** Confirmar orden (con idempotencia)
- **Flujo 4:** Cancelar orden (restaura stock)
- **Flujo 5:** Actualizar inventario
- **Flujo 6:** Búsquedas y filtros
- **Flujo 7:** Casos de error comunes


## Requisitos

### Herramientas
1. **VS Code** con extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

   O alternativamente:

2. **Postman** (importar archivos .http)

### Configuración Previa

1. **Servidor corriendo:**
   ```bash
   cd orders-api
   npm run dev
   ```
   El servidor debe estar en `http://localhost:3002`

2. **Base de datos:**
   - MySQL corriendo
   - Migraciones aplicadas con Prisma
   - Base de datos: `orders_system_db`

3. **Customers API corriendo** (para validar clientes):
   ```bash
   cd customers-api
   npm run dev
   ```
   Debe estar en `http://localhost:3001`


## Variables a Configurar

Antes de ejecutar las pruebas, reemplazar estas variables con valores reales de tu base de datos:

```http
### En products.http y orders.http
@productId = 550e8400-e29b-41d4-a716-446655440000  # ID de producto creado
@customerId = 550e8400-e29b-41d4-a716-446655440000 # ID de cliente de Customers API
@orderId = 550e8400-e29b-41d4-a716-446655440000    # ID de orden creada
```

### Cómo obtener los IDs:

1. **Customer ID:** Crear cliente en Customers API y copiar el `id`
2. **Product ID:** Ejecutar POST /products y copiar el `id` de la respuesta
3. **Order ID:** Ejecutar POST /orders y copiar el `id` de la respuesta

## Token JWT

El token JWT por defecto es un token de ejemplo:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```


## Orden Recomendado de Ejecución

### Primera vez (setup completo):

1. **Crear productos** (`products.http` - secciones 1-4)
2. **Verificar productos** (`products.http` - sección 7)
3. **Actualizar IDs** en variables con los valores reales
4. **Crear órdenes** (`orders.http` - secciones 1-2)
5. **Confirmar orden** (`orders.http` - secciones 18-19)
6. **Cancelar orden** (`orders.http` - secciones 22-23)

### Flujo completo:

Ejecutar `integration-flow.http` en orden secuencial. Este archivo simula un caso de negocio completo.

## Casos de Prueba por Categoría

### Productos
- Creación exitosa
- Validaciones (SKU único, precio positivo, stock positivo)
- Búsqueda y filtrado
- Actualización parcial (precio, stock)
- Paginación
- Casos de error

### Órdenes
- Creación con validación de cliente
- Validación de stock (descuento automático)
- Confirmación idempotente
- Cancelación (restaura stock)
- Filtros por estado y fechas
- Paginación con cursor
- Casos de error

### Integración
- Flujo completo de negocio
- Transacciones distribuidas
- Manejo de inventario
- Idempotencia
- Casos de error realistas

## Respuestas Esperadas

### Éxito
- `201 Created` - Recurso creado (POST)
- `200 OK` - Operación exitosa (GET, PATCH)

### Errores
- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - Sin token o token inválido
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: SKU duplicado)
- `500 Internal Server Error` - Error del servidor

## Características Probadas

- **CRUD completo** de Products y Orders
- **Autenticación JWT** en todos los endpoints
- **Validaciones** con Joi
- **Paginación basada en cursor**
- **Búsqueda y filtrado**
- **Transacciones** (descuento/restauración de stock)
- **Idempotencia** (X-Idempotency-Key)
- **Integración** con Customers API
- **Manejo de errores** consistente
- **Estados de orden** (CREATED, CONFIRMED, CANCELED)
- **Regla de negocio** (10 min para cancelar confirmadas)

## Troubleshooting

### Error: ECONNREFUSED
- Verificar que el servidor esté corriendo en el puerto 3002
- Verificar que Customers API esté en el puerto 3001

### Error: "Customer not found"
- Crear cliente en Customers API primero
- Actualizar la variable `@customerId`

### Error: "Product not found"
- Crear productos primero
- Actualizar las variables `@productId`, `@laptopId`, etc.

### Error: "Insufficient stock"
- Verificar stock disponible con GET /products/:id
- Ajustar cantidad en el request

### Error: "Invalid or expired token"
- Generar nuevo token JWT
- Verificar que `JWT_SECRET` coincida con el del servidor

## Endpoints Disponibles

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/products` | JWT | Crear producto |
| GET | `/products/:id` | JWT | Obtener producto |
| PATCH | `/products/:id` | JWT | Actualizar precio/stock |
| GET | `/products` | JWT | Buscar productos |
| POST | `/orders` | JWT | Crear orden |
| GET | `/orders/:id` | JWT | Obtener orden con items |
| GET | `/orders` | JWT | Buscar órdenes |
| POST | `/orders/:id/confirm` | JWT + Idempotency | Confirmar orden |
| POST | `/orders/:id/cancel` | JWT | Cancelar orden |

## Importante

1. **Idempotencia:** El header `X-Idempotency-Key` es **obligatorio** para confirmar órdenes
2. **Stock:** Se descuenta automáticamente al crear orden, se restaura al cancelar
3. **Estados:** CREATED → CONFIRMED (idempotente), CREATED → CANCELED, CONFIRMED → CANCELED (solo 10 min)
4. **Customer Validation:** Todas las órdenes validan que el cliente exista en Customers API
5. **Paginación:** Usar `cursor` + `limit` para paginación eficiente
6. **Búsqueda:** Los parámetros `search` buscan en nombre y SKU (productos) o estado/fechas (órdenes)

