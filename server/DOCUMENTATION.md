# IESTPFFAA Archives API Documentation

Esta documentación describe los endpoints disponibles en el sistema de gestión de archivos para IESTPFFAA, organizados por controlador.

## Índice
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Documentos](#documentos)
- [Tipos de Documentos](#tipos-de-documentos)
- [Etiquetas](#etiquetas)
- [Metadatos](#metadatos)
- [Registros de Actividad](#registros-de-actividad)
- [Reportes](#reportes)
- [Instrucciones de Uso](#instrucciones-de-uso)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Códigos de Error](#códigos-de-error)
- [Información Técnica](#información-técnica)

## Autenticación

### AuthController

Base URL: `/api/auth`

#### Registro de Usuario
- **Endpoint**: `POST /api/auth/register`
- **Descripción**: Registra un nuevo usuario en el sistema
- **Datos de Entrada**:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "fullName": "string",
    "roleId": 1
  }
  ```
- **Respuesta Exitosa** (201 Created):
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "fullName": "string",
    "status": true,
    "role": {
      "id": 1,
      "name": "string"
    },
    "createdAt": "2025-04-20T10:00:00"
  }
  ```
- **Respuestas de Error**:
  - 400 Bad Request: "Error: El nombre de usuario ya está en uso"
  - 400 Bad Request: "Error: El correo electrónico ya está en uso"
  - 400 Bad Request: "Error: El rol especificado no existe"
  - 500 Internal Server Error

#### Inicio de Sesión
- **Endpoint**: `POST /api/auth/login`
- **Descripción**: Autentica un usuario y devuelve un token JWT
- **Datos de Entrada**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Respuesta Exitosa** (200 OK):
  ```json
  {
    "token": "string",
    "id": 1,
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": {
      "id": 1,
      "name": "string"
    }
  }
  ```
- **Respuestas de Error**:
  - 401 Unauthorized: "Error: Credenciales inválidas"

## Usuarios

### UserController

Base URL: `/api/users`

#### Obtener Todos los Usuarios
- **Endpoint**: `GET /api/users`
- **Descripción**: Obtiene una lista de todos los usuarios
- **Autorización**: Requiere rol ADMIN
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "username": "string",
      "email": "string",
      "fullName": "string",
      "status": true,
      "role": {
        "id": 1,
        "name": "string"
      }
    }
  ]
  ```

#### Obtener Usuario por ID
- **Endpoint**: `GET /api/users/{id}`
- **Descripción**: Obtiene un usuario específico por su ID
- **Parámetros de Ruta**:
  - `id`: ID del usuario
- **Respuesta Exitosa** (200 OK): Objeto usuario
- **Respuestas de Error**:
  - 404 Not Found

#### Obtener Usuario por Nombre de Usuario
- **Endpoint**: `GET /api/users/username/{username}`
- **Descripción**: Obtiene un usuario por su nombre de usuario
- **Parámetros de Ruta**:
  - `username`: Nombre de usuario
- **Respuesta Exitosa** (200 OK): Objeto usuario
- **Respuestas de Error**:
  - 404 Not Found

#### Actualizar Usuario
- **Endpoint**: `PUT /api/users/{id}`
- **Descripción**: Actualiza un usuario existente
- **Autorización**: Requiere rol ADMIN
- **Parámetros de Ruta**:
  - `id`: ID del usuario
- **Datos de Entrada**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "status": true,
    "roleId": 1
  }
  ```
- **Respuesta Exitosa** (200 OK): Usuario actualizado
- **Respuestas de Error**:
  - 404 Not Found

#### Eliminar Usuario
- **Endpoint**: `DELETE /api/users/{id}`
- **Descripción**: Elimina un usuario
- **Parámetros de Ruta**:
  - `id`: ID del usuario
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

## Documentos

### DocumentController

Base URL: `/api/documents`

#### Obtener Todos los Documentos
- **Endpoint**: `GET /api/documents`
- **Descripción**: Obtiene una lista de todos los documentos
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "filePath": "string",
      "format": "string",
      "author": {
        "id": 1,
        "username": "string",
        "fullName": "string"
      },
      "type": {
        "id": 1,
        "name": "string"
      },
      "tags": [
        {
          "id": 1,
          "name": "string"
        }
      ],
      "createdAt": "2025-04-20T10:00:00",
      "updatedAt": "2025-04-20T10:00:00",
      "deleted": false
    }
  ]
  ```
- **Respuestas de Error**:
  - 204 No Content: No hay documentos
  - 500 Internal Server Error

#### Obtener Documento por ID
- **Endpoint**: `GET /api/documents/{id}`
- **Descripción**: Obtiene un documento específico por su ID
- **Parámetros de Ruta**:
  - `id`: ID del documento
- **Respuesta Exitosa** (200 OK): Objeto documento
- **Respuestas de Error**:
  - 404 Not Found

#### Buscar Documentos por Título
- **Endpoint**: `GET /api/documents/search`
- **Descripción**: Busca documentos por título
- **Parámetros de Consulta**:
  - `title`: Título a buscar
- **Respuesta Exitosa** (200 OK): Lista de documentos
- **Respuestas de Error**:
  - 500 Internal Server Error

#### Obtener Documentos por Etiqueta
- **Endpoint**: `GET /api/documents/tag/{tagName}`
- **Descripción**: Obtiene documentos asociados a una etiqueta específica
- **Parámetros de Ruta**:
  - `tagName`: Nombre de la etiqueta
- **Respuesta Exitosa** (200 OK): Lista de documentos
- **Respuestas de Error**:
  - 500 Internal Server Error

#### Obtener Documentos por Autor
- **Endpoint**: `GET /api/documents/author/{authorId}`
- **Descripción**: Obtiene documentos de un autor específico
- **Parámetros de Ruta**:
  - `authorId`: ID del autor
- **Respuesta Exitosa** (200 OK): Lista de documentos
- **Respuestas de Error**:
  - 404 Not Found

#### Crear Documento
- **Endpoint**: `POST /api/documents`
- **Descripción**: Crea un nuevo documento
- **Content-Type**: `multipart/form-data`
- **Parámetros del Formulario**:
  - `file`: Archivo a subir
  - `title`: Título del documento
  - `description`: Descripción del documento
  - `authorId`: ID del autor
  - `type`: Tipo de documento
  - `tags`: Lista de nombres de etiquetas (opcional)
- **Respuesta Exitosa** (201 Created): Documento creado
- **Respuestas de Error**:
  - 400 Bad Request: Archivo vacío o datos inválidos
  - 404 Not Found: Autor no encontrado
  - 500 Internal Server Error

#### Descargar Documento
- **Endpoint**: `GET /api/documents/download/{id}`
- **Descripción**: Descarga un documento específico
- **Parámetros de Ruta**:
  - `id`: ID del documento
- **Respuesta Exitosa** (200 OK): Archivo para descarga
- **Respuestas de Error**:
  - 404 Not Found
  - 500 Internal Server Error

#### Actualizar Documento
- **Endpoint**: `PUT /api/documents/{id}`
- **Descripción**: Actualiza un documento existente
- **Parámetros de Ruta**:
  - `id`: ID del documento
- **Datos de Entrada**:
  ```json
  {
    "title": "string",
    "description": "string",
    "tags": ["string"]
  }
  ```
- **Respuesta Exitosa** (200 OK): Documento actualizado
- **Respuestas de Error**:
  - 404 Not Found

#### Eliminación Suave de Documento
- **Endpoint**: `DELETE /api/documents/{id}`
- **Descripción**: Marca un documento como eliminado (eliminación suave)
- **Parámetros de Ruta**:
  - `id`: ID del documento
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

#### Eliminación Permanente de Documento
- **Endpoint**: `DELETE /api/documents/permanent/{id}`
- **Descripción**: Elimina permanentemente un documento y su archivo asociado
- **Parámetros de Ruta**:
  - `id`: ID del documento
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

## Tipos de Documentos

### DocumentTypeController

Base URL: `/api/document-types`

#### Obtener Todos los Tipos de Documento
- **Endpoint**: `GET /api/document-types`
- **Descripción**: Obtiene una lista de todos los tipos de documento
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "name": "string",
      "description": "string"
    }
  ]
  ```

#### Obtener Tipo de Documento por ID
- **Endpoint**: `GET /api/document-types/{id}`
- **Descripción**: Obtiene un tipo de documento específico por su ID
- **Parámetros de Ruta**:
  - `id`: ID del tipo de documento
- **Respuesta Exitosa** (200 OK): Objeto tipo de documento
- **Respuestas de Error**:
  - 404 Not Found

#### Crear Tipo de Documento
- **Endpoint**: `POST /api/document-types`
- **Descripción**: Crea un nuevo tipo de documento
- **Datos de Entrada**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Respuesta Exitosa** (201 Created): Tipo de documento creado
- **Respuestas de Error**:
  - 400 Bad Request: "Error: Ya existe un tipo de documento con ese nombre"

#### Actualizar Tipo de Documento
- **Endpoint**: `PUT /api/document-types/{id}`
- **Descripción**: Actualiza un tipo de documento existente
- **Parámetros de Ruta**:
  - `id`: ID del tipo de documento
- **Datos de Entrada**: Igual que en creación
- **Respuesta Exitosa** (200 OK): Tipo de documento actualizado
- **Respuestas de Error**:
  - 404 Not Found
  - 400 Bad Request: "Error: Ya existe un tipo de documento con ese nombre"

#### Eliminar Tipo de Documento
- **Endpoint**: `DELETE /api/document-types/{id}`
- **Descripción**: Elimina un tipo de documento
- **Parámetros de Ruta**:
  - `id`: ID del tipo de documento
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

## Etiquetas

### TagController

Base URL: `/api/tags`

#### Obtener Todas las Etiquetas
- **Endpoint**: `GET /api/tags`
- **Descripción**: Obtiene una lista de todas las etiquetas
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "name": "string",
      "description": "string"
    }
  ]
  ```

#### Obtener Etiqueta por ID
- **Endpoint**: `GET /api/tags/{id}`
- **Descripción**: Obtiene una etiqueta específica por su ID
- **Parámetros de Ruta**:
  - `id`: ID de la etiqueta
- **Respuesta Exitosa** (200 OK): Objeto etiqueta
- **Respuestas de Error**:
  - 404 Not Found

#### Buscar Etiquetas por Nombre
- **Endpoint**: `GET /api/tags/search`
- **Descripción**: Busca etiquetas por nombre
- **Parámetros de Consulta**:
  - `name`: Nombre a buscar
- **Respuesta Exitosa** (200 OK): Lista de etiquetas

#### Crear Etiqueta
- **Endpoint**: `POST /api/tags`
- **Descripción**: Crea una nueva etiqueta
- **Datos de Entrada**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Respuesta Exitosa** (201 Created): Etiqueta creada
- **Respuestas de Error**:
  - 400 Bad Request: "Error: Ya existe una etiqueta con ese nombre"

#### Actualizar Etiqueta
- **Endpoint**: `PUT /api/tags/{id}`
- **Descripción**: Actualiza una etiqueta existente
- **Parámetros de Ruta**:
  - `id`: ID de la etiqueta
- **Datos de Entrada**: Igual que en creación
- **Respuesta Exitosa** (200 OK): Etiqueta actualizada
- **Respuestas de Error**:
  - 404 Not Found
  - 400 Bad Request: "Error: Ya existe una etiqueta con ese nombre"

#### Eliminar Etiqueta
- **Endpoint**: `DELETE /api/tags/{id}`
- **Descripción**: Elimina una etiqueta
- **Parámetros de Ruta**:
  - `id`: ID de la etiqueta
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

## Metadatos

### MetadataController

Base URL: `/api/metadata`

#### Obtener Todos los Metadatos
- **Endpoint**: `GET /api/metadata`
- **Descripción**: Obtiene la lista de todos los metadatos
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "document": {
        "id": 1,
        "title": "string"
      },
      "keywords": "string",
      "department": "string",
      "expirationDate": "2025-12-31"
    }
  ]
  ```

#### Obtener Metadatos por ID
- **Endpoint**: `GET /api/metadata/{id}`
- **Descripción**: Obtiene metadatos por su ID
- **Parámetros de Ruta**:
  - `id`: ID de los metadatos
- **Respuesta Exitosa** (200 OK):
  ```json
  {
    "id": 1,
    "document": {
      "id": 1,
      "title": "string"
    },
    "keywords": "string",
    "department": "string",
    "expirationDate": "2025-12-31"
  }
  ```
- **Respuestas de Error**:
  - 404 Not Found

#### Obtener Metadatos por Documento
- **Endpoint**: `GET /api/metadata/document/{documentId}`
- **Descripción**: Obtiene metadatos por ID de documento
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "document": {
        "id": 1,
        "title": "string"
      },
      "keywords": "string",
      "department": "string",
      "expirationDate": "2025-12-31"
    }
  ]
  ```
- **Respuestas de Error**:
  - 404 Not Found

#### Crear Metadatos
- **Endpoint**: `POST /api/metadata/document/{documentId}`
- **Descripción**: Crea metadatos para un documento
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Datos de Entrada**:
  ```json
  {
    "keywords": "string",
    "department": "string",
    "expirationDate": "2025-12-31"
  }
  ```
- **Respuesta Exitosa** (201 Created):
  ```json
  {
    "id": 1,
    "document": {
      "id": 1,
      "title": "string"
    },
    "keywords": "string",
    "department": "string",
    "expirationDate": "2025-12-31"
  }
  ```
- **Respuestas de Error**:
  - 404 Not Found

#### Actualizar Metadatos
- **Endpoint**: `PUT /api/metadata/{id}`
- **Descripción**: Actualiza metadatos
- **Parámetros de Ruta**:
  - `id`: ID de los metadatos
- **Datos de Entrada**:
  ```json
  {
    "keywords": "string",
    "department": "string",
    "expirationDate": "2025-12-31"
  }
  ```
- **Respuesta Exitosa** (200 OK):
  ```json
  {
    "id": 1,
    "document": {
      "id": 1,
      "title": "string"
    },
    "keywords": "string",
    "department": "string",
    "expirationDate": "2025-12-31"
  }
  ```
- **Respuestas de Error**:
  - 404 Not Found

#### Eliminar Metadatos
- **Endpoint**: `DELETE /api/metadata/{id}`
- **Descripción**: Elimina metadatos por su ID
- **Parámetros de Ruta**:
  - `id`: ID de los metadatos
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

#### Eliminar Metadatos por Documento
- **Endpoint**: `DELETE /api/metadata/document/{documentId}`
- **Descripción**: Elimina todos los metadatos asociados a un documento
- **Parámetros de Ruta**:
  - `documentId`: ID del documento
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

## Registros de Actividad

### ActivityLogController

Base URL: `/api/activity-logs`

#### Obtener Todos los Registros de Actividad
- **Endpoint**: `GET /api/activity-logs`
- **Descripción**: Obtiene la lista de todos los registros de actividad
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "string"
      },
      "actionType": "string",
      "description": "string",
      "timestamp": "2025-03-26T18:00:00",
      "ipAddress": "string"
    }
  ]
  ```

#### Obtener Registros de Actividad Paginados
- **Endpoint**: `GET /api/activity-logs/paged?page={page}&size={size}`
- **Descripción**: Obtiene registros de actividad paginados
- **Parámetros de Consulta**:
  - `page`: Número de página (por defecto: 0)
  - `size`: Tamaño de página (por defecto: 20)
- **Respuesta Exitosa** (200 OK):
  ```json
  {
    "content": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "username": "string"
        },
        "actionType": "string",
        "description": "string",
        "timestamp": "2025-03-26T18:00:00",
        "ipAddress": "string"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      }
    },
    "totalElements": 100,
    "totalPages": 5,
    "last": false,
    "first": true,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 20,
    "empty": false
  }
  ```

#### Obtener Registro de Actividad por ID
- **Endpoint**: `GET /api/activity-logs/{id}`
- **Descripción**: Obtiene un registro de actividad por su ID
- **Parámetros de Ruta**:
  - `id`: ID del registro de actividad
- **Respuesta Exitosa** (200 OK):
  ```json
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "string"
    },
    "actionType": "string",
    "description": "string",
    "timestamp": "2025-03-26T18:00:00",
    "ipAddress": "string"
  }
  ```
- **Respuestas de Error**:
  - 404 Not Found

#### Obtener Registros de Actividad por Usuario
- **Endpoint**: `GET /api/activity-logs/user/{userId}`
- **Descripción**: Obtiene registros de actividad por ID de usuario
- **Parámetros de Ruta**:
  - `userId`: ID del usuario
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "string"
      },
      "actionType": "string",
      "description": "string",
      "timestamp": "2025-03-26T18:00:00",
      "ipAddress": "string"
    }
  ]
  ```
- **Respuestas de Error**:
  - 404 Not Found

#### Obtener Registros de Actividad por Tipo de Acción
- **Endpoint**: `GET /api/activity-logs/action-type/{actionType}`
- **Descripción**: Obtiene registros de actividad por tipo de acción
- **Parámetros de Ruta**:
  - `actionType`: Tipo de acción
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "string"
      },
      "actionType": "string",
      "description": "string",
      "timestamp": "2025-03-26T18:00:00",
      "ipAddress": "string"
    }
  ]
  ```

#### Obtener Registros de Actividad por Rango de Tiempo
- **Endpoint**: `GET /api/activity-logs/time-range?startTime={startTime}&endTime={endTime}`
- **Descripción**: Obtiene registros de actividad por rango de tiempo
- **Parámetros de Consulta**:
  - `startTime`: Tiempo de inicio (formato ISO)
  - `endTime`: Tiempo de fin (formato ISO)
- **Respuesta Exitosa** (200 OK):
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "string"
      },
      "actionType": "string",
      "description": "string",
      "timestamp": "2025-03-26T18:00:00",
      "ipAddress": "string"
    }
  ]
  ```

#### Crear Registro de Actividad
- **Endpoint**: `POST /api/activity-logs`
- **Descripción**: Crea un nuevo registro de actividad
- **Datos de Entrada**:
  ```json
  {
    "user": {
      "id": 1
    },
    "actionType": "string",
    "description": "string",
    "ipAddress": "string"
  }
  ```
- **Respuesta Exitosa** (200 OK):
  ```json
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "string"
    },
    "actionType": "string",
    "description": "string",
    "timestamp": "2025-03-26T18:00:00",
    "ipAddress": "string"
  }
  ```

#### Eliminar Registro de Actividad
- **Endpoint**: `DELETE /api/activity-logs/{id}`
- **Descripción**: Elimina un registro de actividad
- **Parámetros de Ruta**:
  - `id`: ID del registro de actividad
- **Respuesta Exitosa** (204 No Content)
- **Respuestas de Error**:
  - 404 Not Found

## Reportes

### ReportController

Base URL: `/api/reports`

#### Descargar Reporte en PDF
- **Endpoint**: `GET /api/reports/{id}/pdf`
- **Descripción**: Descarga la versión PDF del reporte generado
- **Parámetros de Ruta**:
  - `id`: ID del reporte
- **Respuesta Exitosa** (200 OK): Archivo PDF (`application/pdf`)
- **Respuestas de Error**:
  - 404 Not Found
  - 500 Internal Server Error

#### Descargar Reporte en Excel
- **Endpoint**: `GET /api/reports/{id}/excel`
- **Descripción**: Descarga la versión en Excel del reporte generado
- **Parámetros de Ruta**:
  - `id`: ID del reporte
- **Respuesta Exitosa** (200 OK): Archivo Excel (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
- **Respuestas de Error**:
  - 404 Not Found
  - 500 Internal Server Error

## Instrucciones de Uso

### Autenticación

Para utilizar la mayoría de los endpoints, primero debes autenticarte:

1. Registra un usuario con `POST /api/auth/register`
2. Inicia sesión con `POST /api/auth/login` para obtener un token JWT
3. Incluye el token en el encabezado de autorización de todas las solicitudes subsiguientes:
   ```
   Authorization: Bearer <token>
   ```

### Gestión de Documentos

El flujo típico para la gestión de documentos es:

1. Crear un documento con `POST /api/documents`
2. Añadir metadatos con `POST /api/metadata/document/{documentId}`
3. Añadir etiquetas con `PUT /api/documents/{id}` incluyendo las etiquetas en el cuerpo de la solicitud
4. Buscar documentos por título, etiqueta o autor
5. Descargar documentos con `GET /api/documents/download/{id}`

### Registros de Actividad

El sistema registra automáticamente las actividades de los usuarios. Puedes:

1. Ver todos los registros con `GET /api/activity-logs`
2. Filtrar por usuario, tipo de acción o rango de tiempo
3. Ver registros paginados para mejor rendimiento con conjuntos de datos grandes

## Consideraciones de Seguridad

- Todos los endpoints (excepto `/api/auth/**`) requieren autenticación
- Los usuarios solo pueden acceder a los recursos según su rol y permisos
- Las contraseñas se almacenan cifradas con BCrypt
- Los tokens JWT tienen una duración limitada (24 horas por defecto)

## Códigos de Error Comunes

- 400 Bad Request: Datos de entrada inválidos o duplicados
- 401 Unauthorized: No autenticado o token inválido
- 403 Forbidden: No autorizado para acceder al recurso
- 404 Not Found: Recurso no encontrado
- 500 Internal Server Error: Error del servidor

## Información Técnica

Este API está construido con:
- Java 17
- Spring Boot 3.3.1
- SQLite como base de datos embebida
- JPA para persistencia
- Spring Security para autenticación
- JWT para tokens de seguridad

La arquitectura sigue un enfoque de Clean Architecture con:
- Entidades en domain/entity
- Repositorios en domain/repository
- Servicios en application/service
- Controladores en infrastructure/web/controller
- Configuración en infrastructure/config
