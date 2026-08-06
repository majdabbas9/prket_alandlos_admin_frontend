# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Build-time environment variables for Vite
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build SPA static bundle
COPY . .
RUN npm run build

# Production Stage
FROM nginx:1.25-alpine

# Copy Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose web server port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
