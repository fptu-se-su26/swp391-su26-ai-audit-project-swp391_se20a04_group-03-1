FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]
