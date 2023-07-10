# Define la imagen base
FROM node:16

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias del proyecto
RUN npm install -g pnpm
RUN pnpm install

# Copia el resto de los archivos del proyecto
COPY . .

EXPOSE 3000

CMD [ "pnpm", "start" ]