# Development image: Vite dev server with hot reload.
FROM node:22-alpine

# Package manager
RUN npm install -g pnpm@10.34.7

WORKDIR /app

# Install dependencies first to take advantage of the Docker layer cache
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Application source
COPY frontend/ ./

EXPOSE 80

CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
