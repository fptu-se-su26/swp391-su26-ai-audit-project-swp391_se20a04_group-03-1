# Stage 1: Dependencies and Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package metadata
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source code (respects .dockerignore)
COPY . .

# --- BẮT BUỘC KHAI BÁO ARG ĐỂ NHẬN BIẾN LÚC BUILD ---
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CV_URL

# Gán giá trị ARG vào ENV để Next.js lấy được khi chạy lệnh build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CV_URL=$NEXT_PUBLIC_CV_URL

# Build Next.js for production
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy required files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Expose port 3000
EXPOSE 3000

# Start Next.js production server
CMD ["npm", "run", "start"]
