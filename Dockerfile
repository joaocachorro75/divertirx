# Builder stage
FROM node:21-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++ libuv-dev

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:21-alpine AS production

WORKDIR /app

# Install runtime dependencies for sqlite3
RUN apk add --no-cache python3 make g++ sqlite-libs

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env* ./

# Create database directory
RUN mkdir -p database

# Set permissions
RUN chown -R node:node /app

# Expose port
EXPOSE 3000

# Switch to non-root user
USER node

# Start the application
CMD ["npm", "start"]
