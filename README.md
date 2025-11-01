## Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                         Cliente                              │
└────────────┬─────────────────────────────────┬───────────────┘
             │                                 │
             │                                 │
             ▼                                 ▼
┌─────────────────────┐              ┌──────────────────────┐
│   Lambda            │              │   Customers API      │
│   Orchestrator      │◄────────────►│   (Puerto 3001)      │
│   (Serverless)      │              │                      │
└──────────┬──────────┘              └──────────┬───────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
┌─────────────────────┐              ┌──────────────────────┐
│   Orders API        │              │   MySQL Database     │
│   (Puerto 3002)     │◄─────────────►   - customers_db   │
│                     │              │   - orders_db        │
└─────────────────────┘              └──────────────────────┘
```

## Estructura del Proyecto

```
microservices-orchestrator-orders/
├── customers-api/           # Microservicio de Clientes
│   ├── src/
│   │   ├── domain/         # Entidades y lógica de dominio
│   │   ├── usecases/       # Casos de uso
│   │   └── infrastructure/ # Repositorios, APIs, validadores
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   └── package.json
│
├── orders-api/             # Microservicio de Pedidos
│   ├── src/
│   │   ├── domain/         # Entidades (Product, Order, OrderItem)
│   │   ├── usecases/       # Casos de uso
│   │   └── infrastructure/ # Repositorios, APIs, validadores
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── openapi.yaml        # Documentación OpenAPI
│   └── package.json
│
├── lambda-orchestrator/    # Lambda para orquestación
│   ├── src/
│   │   └── handler.js      # Handler de Lambda
│   ├── serverless.yml      # Configuración Serverless Framework
│   └── package.json
│
├── db/
│   └── init/
│       └── 01-create-databases.sql  # Script de inicialización
│
├── docker-compose.yml       # Configuración producción
└── README.md
```

## Requisitos Previos

- Docker 20.x o superior
- Docker Compose 2.x o superior
- Node.js 22.x (para desarrollo local)
- AWS CLI (para despliegue de Lambda)
- Serverless Framework (para despliegue de Lambda)

## Inicio Rápido con Docker

### 1. Configuración Inicial

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```bash
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER=orders_user
MYSQL_PASSWORD=orders_pass123

# Authentication
JWT_SECRET=your-jwt-secret-change-in-production
SERVICE_TOKEN=your-service-token-change-in-production
```

### 2. Levantar el Sistema Completo

```bash
# Levantar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f customers-api
docker compose logs -f orders-api
docker compose logs -f mysql
```

### 3. Verificar Estado de los Servicios

```bash
# Verificar que todos los contenedores estén corriendo
docker compose ps

# Verificar health checks
docker inspect orders-system-mysql | grep -A 10 Health
docker inspect customers-api | grep -A 10 Health
docker inspect orders-api | grep -A 10 Health
```

### 4. Acceder a los Servicios

- **Customers API**: http://localhost:3001
- **Orders API**: http://localhost:3002
- **MySQL**: localhost:3306

### 5. Detener el Sistema

```bash
# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

## Desarrollo Local

### Opción 1: Solo Base de Datos en Docker

Para desarrollo local, puedes correr solo MySQL en Docker y las APIs localmente:

```bash
# Levantar solo MySQL con phpMyAdmin
docker-compose -f docker-compose.dev.yml up -d

# En otra terminal - Customers API
cd customers-api
npm install
cp .env.example .env
# Editar .env con DATABASE_URL=mysql://orders_user:orders_pass123@localhost:3306/customers_db
npx prisma migrate dev
npm run dev

# En otra terminal - Orders API
cd orders-api
npm install
cp .env.example .env
# Editar .env con:
# DATABASE_URL=mysql://orders_user:orders_pass123@localhost:3306/orders_db
# CUSTOMERS_API_URL=http://localhost:3001
npx prisma migrate dev
npm run dev
```

Acceso a phpMyAdmin: http://localhost:8080
- Servidor: mysql
- Usuario: root
- Contraseña: root123

### Opción 2: Todo en Docker

```bash
docker-compose up --build
```

## Configuración de Lambda Orchestrator

### Desarrollo Local

```bash
cd lambda-orchestrator
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env:
# CUSTOMERS_API_URL=http://localhost:3001
# ORDERS_API_URL=http://localhost:3002
# SERVICE_TOKEN=your-service-token

# Instalar Serverless Offline
npm install --save-dev serverless-offline

# Ejecutar localmente
serverless offline
```

La Lambda estará disponible en: http://localhost:3000/orchestrate-order

### Despliegue a AWS

```bash
cd lambda-orchestrator

# Configurar variables de entorno en AWS
# Editar serverless.yml con las URLs de producción

# Desplegar
serverless deploy --stage prod

# Ver logs
serverless logs -f orchestrateOrder -t --stage prod

# Eliminar
serverless remove --stage prod
```


## Documentación de API

### Customers API

Endpoints disponibles:
- `POST /customers` - Crear cliente
- `GET /customers/:id` - Obtener cliente
- `GET /customers?search=&cursor=&limit=` - Buscar clientes
- `PATCH /customers/:id` - Actualizar cliente
- `DELETE /customers/:id` - Eliminar cliente (soft delete)
- `GET /internal/customers/:id` - Validar cliente (interno)

### Orders API

Documentación completa OpenAPI: `orders-api/openapi.yaml`

**Productos:**
- `POST /products` - Crear producto
- `GET /products/:id` - Obtener producto
- `GET /products?search=&cursor=&limit=` - Buscar productos
- `PATCH /products/:id` - Actualizar producto (precio/stock)

**Órdenes:**
- `POST /orders` - Crear orden
- `GET /orders/:id` - Obtener orden
- `GET /orders?status=&from=&to=&cursor=&limit=` - Buscar órdenes
- `POST /orders/:id/confirm` - Confirmar orden (idempotente)
- `POST /orders/:id/cancel` - Cancelar orden

Ver `orders-api/openapi.yaml` para detalles completos de esquemas, validaciones y ejemplos.

## Gestión de Base de Datos

### Migraciones Prisma

**Customers API:**
```bash
cd customers-api
npx prisma migrate dev --name migration_name
npx prisma migrate deploy  # Producción
npx prisma studio         # GUI para explorar datos
```

**Orders API:**
```bash
cd orders-api
npx prisma migrate dev --name migration_name
npx prisma migrate deploy  # Producción
npx prisma studio         # GUI para explorar datos
```

### Acceso Directo a MySQL

```bash
# Usando Docker
docker exec -it orders-system-mysql mysql -u root -p

# Desde host (si tienes mysql-client)
mysql -h localhost -u orders_user -p

# Listar bases de datos
SHOW DATABASES;

# Usar base de datos
USE customers_db;
USE orders_db;

# Ver tablas
SHOW TABLES;
```

### Backup y Restore

**Backup:**
```bash
# Backup de customers_db
docker exec orders-system-mysql mysqldump -u root -proot123 customers_db > backup_customers.sql

# Backup de orders_db
docker exec orders-system-mysql mysqldump -u root -proot123 orders_db > backup_orders.sql

# Backup de todas las bases de datos
docker exec orders-system-mysql mysqldump -u root -proot123 --all-databases > backup_all.sql
```

**Restore:**
```bash
# Restore customers_db
docker exec -i orders-system-mysql mysql -u root -proot123 customers_db < backup_customers.sql

# Restore orders_db
docker exec -i orders-system-mysql mysql -u root -proot123 orders_db < backup_orders.sql
```

## Troubleshooting

### Los contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Reconstruir imágenes
docker-compose up --build --force-recreate

# Limpiar todo y empezar de nuevo
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Error de conexión a MySQL

```bash
# Verificar que MySQL esté saludable
docker inspect orders-system-mysql | grep Health

# Verificar variables de entorno
docker exec orders-system-mysql env | grep MYSQL

# Probar conexión manualmente
docker exec orders-system-mysql mysql -u orders_user -porders_pass123 -e "SHOW DATABASES;"
```

### APIs no pueden conectarse entre sí

```bash
# Verificar red de Docker
docker network ls
docker network inspect orders-network

# Verificar que todos estén en la misma red
docker inspect customers-api | grep -A 10 Networks
docker inspect orders-api | grep -A 10 Networks
```

### Prisma migrations fallan

```bash
# Dentro del contenedor
docker exec -it customers-api sh
npx prisma migrate status
npx prisma migrate resolve --applied "migration_name"

# O forzar reset (CUIDADO: borra datos)
docker exec -it customers-api npx prisma migrate reset
```

### Puerto ya en uso

```bash
# Encontrar qué está usando el puerto
lsof -i :3001
lsof -i :3002
lsof -i :3306

# Matar el proceso
kill -9 <PID>
```


## Monitoreo

### Docker Stats

```bash
# Ver uso de recursos
docker stats

# Ver uso de un contenedor específico
docker stats customers-api
```

### Logs

```bash
# Tail de todos los logs
docker-compose logs -f

# Últimas 100 líneas
docker-compose logs --tail=100

# Solo errores (aproximado)
docker-compose logs | grep -i error
```

### Health Checks

```bash
# Script de verificación
curl -f http://localhost:3001/health || echo "Customers API down"
curl -f http://localhost:3002/health || echo "Orders API down"
```
