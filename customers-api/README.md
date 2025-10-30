# Customers API

API de gestión de clientes

## Arquitectura

Este proyecto implementa **Clean Architecture**

```
src/
├── domain/              # Capa de dominio (entidades, interfaces)
│   └── customer/
│       ├── entity/      # Entidades de dominio
│       ├── gateway/     # Interfaces de repositorios
│       └── value-objects/  # DTOs y value objects
├── usecases/            # Casos de uso (lógica de negocio)
├── infrastructure/      # Capa de infraestructura
│   ├── api/            # API REST (Express)
│   ├── repositories/   # Implementación de repositorios
│   └── package/        # Clientes externos (Prisma)
└── generated/          # Código generado (Prisma Client)
```

## Tecnologías

- **Node.js** 22.x
- **TypeScript** 5.7.x
- **Express** 5.1.x
- **Prisma ORM** 6.13.x
- **MySQL** 8.x
- **JWT** para autenticación
- **Joi** para validación



## Instalación

1. Clonar el repositorio:
```bash
cd customers-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
DATABASE_URL="mysql://user:password@host:port/database_name"
JWT_SECRET="your-jwt-secret-here"
SERVICE_TOKEN="your-service-token-here"
PORT=3001
```

4. Generar el cliente de Prisma:
```bash
npx prisma generate --schema=prisma/schema.prisma
```

5. Ejecutar migraciones:
```bash
npx prisma migrate deploy
```

## Ejecución

### Modo desarrollo
```bash
npm run dev
```

### Modo producción
```bash
npm run build
npm start
```

## Docker

### Construir imagen
```bash
docker build -t customers-api .
```

### Ejecutar contenedor
```bash
docker run -p 3001:3001 --env-file .env customers-api
```

## Autenticación

### JWT Token (Para clientes externos)

Generar token JWT para pruebas:
```bash
node -e "const jwt = require('jsonwebtoken'); const token = jwt.sign({ userId: 'test-user-123', email: 'test@example.com' }, 'YOUR_JWT_SECRET', { expiresIn: '24h' }); console.log(token);"
```

### Service Token (Para comunicación entre microservicios)

Usar el `SERVICE_TOKEN` definido en `.env` para comunicación interna entre servicios (ej: Orders -> Customers).

## 🗄️ Base de datos

### Modelo de datos

```prisma
model Customer {
  id        String   @id
  name      String
  email     String   @unique
  phone     String
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("customers")
}
```

### Migraciones

Crear nueva migración:
```bash
npx prisma migrate dev --name nombre_migracion
```

Aplicar migraciones en producción:
```bash
npx prisma migrate deploy
```

Ver estado de migraciones:
```bash
npx prisma migrate status
```

### Prisma Studio

Abrir interfaz gráfica de la base de datos:
```bash
npx prisma studio
```

## Pruebas

Las pruebas HTTP están disponibles en `api-test/customer.http`. Puedes ejecutarlas con:
- VS Code REST Client extension
- IntelliJ HTTP Client
- Cualquier cliente HTTP


## Patrones de diseño

- **Repository Pattern**: Abstracción de acceso a datos
- **Use Case Pattern**: Encapsulación de lógica de negocio
- **Factory Pattern**: Creación de instancias con métodos estáticos `create()`
- **Dependency Injection**: A través de constructores
- **Soft Delete**: Los registros no se eliminan, se marcan como `isDeleted: true`

## Estructura de archivos importantes

```
customers-api/
├── src/
│   ├── main.ts                 # Punto de entrada
│   ├── domain/                 # Lógica de dominio
│   ├── usecases/              # Casos de uso
│   └── infrastructure/        # Implementaciones
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   └── migrations/            # Migraciones
├── api-test/
│   └── customer.http          # Pruebas HTTP
├── Dockerfile                 # Configuración Docker
├── .env.example              # Variables de entorno de ejemplo
├── tsconfig.json             # Configuración TypeScript
├── package.json              # Dependencias
└── README.md                 # Informacion extra
```

## Seguridad

- Tokens JWT con expiración configurable
- Tokens de servicio para comunicación interna
- Validación de entrada con Joi
- Variables sensibles en archivo `.env` (no versionado)

## Scripts disponibles

```bash
npm run build      # Compilar TypeScript a JavaScript
npm run dev        # Ejecutar en modo desarrollo con nodemon
npm start          # Ejecutar versión compilada (producción)
npm run start:dev  # Ejecutar con ts-node (desarrollo)
```
