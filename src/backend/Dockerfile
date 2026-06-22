# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package metadata
COPY package*.json ./

# Install ALL dependencies (including devDependencies like typescript)
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy package metadata
COPY package*.json ./

# Install ONLY production dependencies (reduces image size significantly)
RUN npm install --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 4000 for the backend API
EXPOSE 4000

# Start the compiled application
CMD ["node", "dist/index.js"]
