# Lambda Orchestrator - Sistema de Pedidos

Función AWS Lambda que orquesta el flujo completo de creación y confirmación de pedidos a través de microservicios.

## Descripción General

Esta función Lambda coordina el siguiente flujo de trabajo:
1. **Valida cliente** - Verifica si el cliente existe a través de Customers API
2. **Crea pedido** - Crea el pedido con items a través de Orders API
3. **Confirma pedido** - Confirma automáticamente el pedido (con idempotencia)
4. **Retorna resultado** - Devuelve la respuesta orquestada completa

## Arquitectura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /orchestrate-order
       ▼
┌─────────────────────┐
│ Lambda Orchestrator │
└──────┬──────┬───────┘
       │      │
       │      └─────────┐
       ▼                ▼
┌──────────────┐ ┌──────────────┐
│Customers API │ │  Orders API  │
└──────────────┘ └──────────────┘
```

## Requisitos Previos

- Node.js 22.x
- AWS CLI configurado (para despliegue)
- Serverless Framework
- Instancias en ejecución de:
  - Customers API (puerto 3001)
  - Orders API (puerto 3002)

## Instalación

```bash
cd lambda-orchestrator
npm install
```

## Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Configurar las siguientes variables:

- `CUSTOMERS_API_URL` - URL de Customers API (por defecto: http://localhost:3001)
- `ORDERS_API_URL` - URL de Orders API (por defecto: http://localhost:3002)
- `SERVICE_TOKEN` - Token JWT para autenticación servicio-a-servicio

### Configuración de Serverless

El archivo `serverless.yml` está configurado para:
- **Runtime**: Node.js 22.x
- **Región**: us-east-1 (configurable)
- **Memoria**: 256 MB
- **Timeout**: 30 segundos
- **Endpoint HTTP**: POST /orchestrate-order

## Desarrollo Local

### Usando Serverless Offline

Instalar plugin serverless-offline:

```bash
npm install --save-dev serverless-offline
```

Ejecutar localmente:

```bash
npm run dev
```

La función estará disponible en: `http://localhost:3000/orchestrate-order`

### Probar Localmente

Usando el archivo event.json proporcionado:

```bash
serverless invoke local -f orchestrateOrder --path event.json
```

Usando curl:

```bash
curl -X POST http://localhost:3000/orchestrate-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "customer-uuid-aqui",
    "items": [
      {
        "product_id": "product-uuid-aqui",
        "qty": 2
      }
    ]
  }'
```

## Despliegue

### Desplegar en AWS

```bash
# Desplegar en stage dev (por defecto)
serverless deploy

# Desplegar en stage específico
serverless deploy --stage prod

# Desplegar en región específica
serverless deploy --region us-west-2
```

### Ver Logs

```bash
serverless logs -f orchestrateOrder -t

```


## Documentación de API

### Endpoint

```
POST /orchestrate-order
```

### Request

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "product_id": "660e8400-e29b-41d4-a716-446655440000",
      "qty": 2
    },
    {
      "product_id": "770e8400-e29b-41d4-a716-446655440000",
      "qty": 1
    }
  ]
}
```

### Response

**Éxito (201 Created):**
```json
{
  "message": "Order orchestrated successfully",
  "customer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "order": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "customerId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED",
    "totalCents": 4500,
    "items": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440000",
        "productId": "660e8400-e29b-41d4-a716-446655440000",
        "qty": 2,
        "unitPriceCents": 1500,
        "subtotalCents": 3000
      }
    ],
    "createdAt": "2025-10-31T14:30:00.000Z",
    "updatedAt": "2025-10-31T14:30:01.000Z"
  }
}
```

**Respuestas de Error:**

- `400 Bad Request` - Datos de entrada inválidos
- `404 Not Found` - Cliente no encontrado
- `500 Internal Server Error` - Falló la orquestación



## Idempotencia

El orquestador implementa idempotencia para la confirmación de pedidos:

- Previene confirmaciones duplicadas
- Seguro para reintentos en caso de fallos de red



## Seguridad

### Autenticación

- Usa autenticación con token JWT bearer
- Token servicio-a-servicio (SERVICE_TOKEN) para llamadas internas a APIs
- Sin acceso directo a base de datos (sigue patrón de microservicios)

