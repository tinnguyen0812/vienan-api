# Stage 1 — Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2 — Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy built output from builder stage
# NestJS with sourceRoot=src outputs to dist/src/
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
