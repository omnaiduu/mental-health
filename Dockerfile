# Global build arguments
ARG VITE_BACKEND=http://localhost:3001
ARG VITE_WS=ws://localhost:3001

# Stage 1: Frontend Build
FROM oven/bun:latest AS frontend-build

# Redeclare build args in this stage
ARG VITE_BACKEND
ARG VITE_WS

# Set environment variables
ENV VITE_BACKEND=${VITE_BACKEND}
ENV VITE_WS=${VITE_WS}

WORKDIR /mental-health

# Copy all packages and apps
COPY ./packages ./packages
COPY ./apps ./apps
COPY package.json bun.lock ./

WORKDIR /mental-health/apps/frontend
RUN rm -rf .env.production
RUN bun install
RUN bun run build

# Stage 2: Backend Setup
FROM oven/bun:latest

# Redeclare args if needed in backend
ARG VITE_BACKEND
ARG VITE_WS

WORKDIR /app
COPY package.json bun.lock ./
COPY ./packages ./packages
COPY ./apps ./apps
COPY --from=frontend-build /mental-health/apps/frontend/build ./apps/backend-api/build
COPY --from=frontend-build /mental-health/apps/frontend/build ./apps/frontend/build
COPY ./packages/backend/migrations ./apps/backend-api/migrations

WORKDIR /app/apps/backend-api
RUN bun install

CMD ["bun", "run", "start"]