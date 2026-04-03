# Etapa 1: Construcción (Build)
FROM node:20 AS build
WORKDIR /app

# Copiamos archivos de dependencias para aprovechar el caché de Docker
COPY package*.json ./
RUN npm install

# Copiamos el código fuente y generamos el build de producción
COPY . .
RUN npm run build --prod

# Etapa 2: Servidor de Producción (Nginx)
FROM nginx:alpine

# IMPORTANTE: Copiamos tu archivo nginx.conf personalizado
# Esto evita los errores 404 al recargar rutas como /tienda
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos desde la etapa de compilación
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]