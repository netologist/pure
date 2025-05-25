# Simple Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server.js ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

# # Dockerfile
# FROM node:23-alpine AS base
# WORKDIR /app

# # Install dependencies
# FROM base AS deps
# COPY package*.json ./
# COPY server.js ./
# RUN npm ci --only=production && npm cache clean --force

# # Build stage (if you had build steps)
# FROM base AS build
# COPY package*.json ./
# COPY server.js ./
# RUN npm ci
# COPY . .
# # RUN npm run build (if you had a build step)

# # Runtime stage
# FROM node:23-alpine AS runtime
# WORKDIR /app

# # Create non-root user
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nodejs

# # Copy node_modules from deps stage
# COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# # Copy application code
# COPY --chown=nodejs:nodejs . .

# # Expose port
# EXPOSE 8080

# # Switch to non-root user
# USER nodejs

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# # Start the application
# CMD ["npm", "start"]
