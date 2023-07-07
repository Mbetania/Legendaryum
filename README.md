# Legendaryum

## Descripción del Proyecto
Legendaryum es un microservicio donde los clientes pueden conectarse e ingresar a una sala para jugar con otro cliente. La idea principal es agarrar las monedas disponibles. Si el cliente no desea jugar, puede realizar consultas para ver cuántas monedas tiene en total.

Un cliente puede crear la sala y el otro recibe un ID para unirse a esa sala. Una vez que ambos clientes están en la sala, se generan las monedas, las cuales pueden ser recolectadas solo por uno de los clientes. Cada moneda tiene un tiempo de vida útil de 1 hora y ocupa un espacio en un entorno 3D.

## Instalación y Uso
Este microservicio está dockerizado para facilitar su despliegue. A continuación, se detallan los pasos para instalar y utilizar el servicio:

### Requisitos Previos
Necesitarás tener Docker y Docker Compose instalados en tu máquina. Si aún no los tienes, puedes descargarlos desde aquí:

- [Docker]
- [Docker Compose]

### Instalación y Ejecución
1. Clona este repositorio en tu máquina local utilizando `git clone`.
2. Navega al directorio del proyecto: `cd legendaryum`.
3. Construye y levanta el servicio con Docker Compose: `docker-compose up --build`.

## Endpoints
### Cliente
- **GET /api/client/:clientId**: Obtiene el cliente mediante el ID proporcionado. Ejemplo de uso en Postman: `http://localhost:3000/api/client/:clientId`, donde `:clientId` se reemplaza por el ID del cliente que deseas obtener.

- **POST /api/client/**: Crea un nuevo cliente en la base de datos con un ID y token únicos. No requiere parámetros en la ruta o en la consulta. Ejemplo de uso en Postman: `http://localhost:3000/api/client/`.

- **DELETE /api/client/:clientId**: Elimina un cliente utilizando su ID. Ejemplo de uso en Postman: `http://localhost:3000/api/client/:clientId`, donde `:clientId` se reemplaza por el ID del cliente que deseas eliminar.

### Sala
- **GET /api/room/:roomId**: Obtiene una sala por su ID. Ejemplo de uso en Postman: `http://localhost:3000/api/room/:roomId`, donde `:roomId` se reemplaza por el ID de la sala que deseas obtener.

- **POST /api/room/**: Crea una nueva sala con valores predeterminados. No requiere parámetros en la ruta o en la consulta. Ejemplo de uso en Postman: `http://localhost:3000/api/room/`.

- **PATCH /api/room/:roomId/join**: Permite a un cliente unirse a una sala. Requiere el ID de la sala en la ruta y el ID del cliente en el cuerpo de la solicitud. Ejemplo de uso en Postman: `http://localhost:3000/api/room/:roomId/join`, donde `:roomId` se reemplaza por el ID de la sala. El cuerpo de la solicitud debe ser un JSON que contiene el ID del cliente, por ejemplo:
```json
{
    "clientId": "5139c404-84e5-4bdf-a00d-a733bfaf119f"
}
```
- `PATCH /api/room/:roomId/reset`: Restablece una sala a sus valores predeterminados. Requiere el ID de la sala en la ruta. Ejemplo de uso en Postman: `http://localhost:3000/api/room/:roomId/reset`, donde `:roomId` se reemplaza por el ID de la sala.

#### Monedas

- **GET /api/coin/client/:clientId/coins**: Obtiene las monedas de un cliente. Requiere el ID del cliente en la ruta. Ejemplo de uso en Postman: `http://localhost:3000/api/coin/client/:clientId/coins`, donde `:clientId` se reemplaza por el ID del cliente.
- **PATCH /api/coin/room/:roomId/client/:clientId**: Asigna una moneda de la sala a un cliente. Requiere el ID de la sala y del cliente en la ruta, y el ID de la moneda en el cuerpo de la solicitud. Ejemplo de uso en Postman: `http://localhost:3000/api/coin/room/:roomId/client/:clientId`, donde `:roomId` y `:clientId` se reemplazan por los IDs correspondientes. El cuerpo de la solicitud debe ser un JSON que contiene el ID de la moneda, por ejemplo:

```json
{
    "coinId":"69874261-3b34-41b1-8c55-e0682dcd0ee1"
}
```
- **POST /api/coin/room/:roomId/coins**: Genera monedas para una sala específica. Requiere el ID de la sala en la ruta. Ejemplo de uso en Postman: `http://localhost:3000/api/coin/room/:roomId/coins`, donde `:roomId` se reemplaza por el ID de la sala.

### Códigos de Respuesta

- **200 OK**: La solicitud se ha realizado correctamente.
- **201 Created**: Se ha creado un nuevo recurso correctamente.
- **204 No Content**: La solicitud se ha procesado correctamente, pero no devuelve ningún contenido.
- **400 Bad Request**: La solicitud no se ha podido procesar debido a problemas de sintaxis o a solicitudes incorrectas.
- **401 Unauthorized**: La solicitud requiere autenticación.
- **403 Forbidden**: El cliente no tiene los derechos necesarios para acceder a este recurso.
- **404 Not Found**: El recurso solicitado no se ha encontrado.
- **409 Conflict**: La solicitud no se ha podido completar debido a un conflicto con el estado actual del recurso.
- **500 Internal Server Error**: Error interno del servidor, puede suceder cuando algo inesperado falla.

## Clientes de la aplicación
**La aplicación dispone de dos diferentes interfaces de cliente para interactuar con el servidor y jugar.**

**Cliente CLI (Interfaz de línea de comandos)**
El Cliente CLI es un interfaz de texto, útil para pruebas rápidas y para interactuar con el servidor sin necesidad de una interfaz gráfica. Para ejecutar el Cliente CLI, utiliza el comando:
`pnpm buildAndTest`

**Cliente de la Interfaz de Usuario (UI)**
El Cliente UI es una interfaz gráfica construida con React y Three.js, que permite una interacción visual con el juego en un navegador web. Este se encuentra en un proyecto aparte denominado legendaryum-front.
Para ejecutar el Cliente UI, primero deberás clonar el repositorio, luego instalarlo mediante `pnpm install`. Luego utiliza el siguiente comando en el directorio del proyecto legendaryum-front:
`pnpm dev`
Este comando inicia el entorno de desarrollo y abre una nueva ventana del navegador con la interfaz de usuario del juego, permitiendo a los usuarios moverse en el entorno 3D, recoger monedas e interactuar con otros jugadores en la sala.
