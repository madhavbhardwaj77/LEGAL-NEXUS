# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Build React application
RUN npm run build


# Serve stage
FROM nginx:alpine

# Copy production build to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]