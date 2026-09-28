# Stage 1: build the static site with Node.
FROM node:24-alpine AS build
WORKDIR /app

# Dependencies before code, so editing code does not reinstall packages (layer cache).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Empty API URL: the site calls "/api/..." on its own address and nginx forwards it to the backend.
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: only nginx and the built files; Node and node_modules stay in the build stage.
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
