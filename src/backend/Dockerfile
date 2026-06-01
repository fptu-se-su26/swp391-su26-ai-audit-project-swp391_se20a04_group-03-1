FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (assuming Express runs on 4000)
EXPOSE 4000

# Start command
# For production, it is recommended to compile TypeScript and run the JS output
# Here we use ts-node to run directly for simplicity
RUN npm install -g ts-node typescript
CMD ["npx", "ts-node", "index.ts"]
