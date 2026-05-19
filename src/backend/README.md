# Backend API

## Description
The Backend API is built with Express.js and TypeScript, using MongoDB as the database. The API supports JWT authentication, cookie management, and CORS.

## Technology Stack
- Runtime: Node.js
- Framework: Express.js 5.x
- Language: TypeScript
- Database: MongoDB (Mongoose)
- Authentication: JWT (jsonwebtoken)
- Password Encryption: bcryptjs
- Validation: Joi

## Directory Structure
```
src/backend/
├── config/          # Application configuration
├── controllers/     # Request handling logic
├── middlewares/     # Express middlewares
├── models/          # MongoDB schemas
├── routers/         # API routing
├── validators/      # Validation schemas (Joi)
├── helpers/         # Helper functions
├── index.ts         # Application entry point
├── package.json
└── package-lock.json
```

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend root directory:
```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/your_database_name

# JWT
JWT_SECRET=your_secret_key_here

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Application

Development (with hot reload):
```bash
npm run dev
```

Production (build TypeScript first):
```bash
npx tsc
node index.js
```

## API Endpoints

- Server Port: 4000
- Base URL: http://localhost:4000
- CORS Origin: http://localhost:3000

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.2.1 | Web framework |
| mongoose | 9.1.4 | MongoDB ODM |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcryptjs | 3.0.3 | Password hashing |
| cors | 2.8.5 | Cross-Origin Resource Sharing |
| cookie-parser | 1.4.7 | Cookie parsing |
| joi | 18.0.2 | Data validation |
| dotenv | 17.2.3 | Environment variables |

## Development Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking and compilation |
| ts-node | Run TypeScript directly |
| nodemon | Auto-reload on file changes |
| @types/* | TypeScript type definitions |

## Development Process

1. Create Model (models/) - Define MongoDB schemas
2. Create Validator (validators/) - Validate request data using Joi
3. Create Controller (controllers/) - Handle business logic
4. Create Router (routers/) - Define API endpoints
5. Create Middleware (middlewares/) - Authentication, error handling, logging
6. Configure (config/) - Database connection, constants

## Key Features

- TypeScript support
- JWT authentication
- MongoDB integration
- Input validation with Joi
- Password encryption with bcryptjs
- CORS enabled
- Cookie management
- Hot reload development mode

## Troubleshooting

### Port 4000 is Already in Use
Change the PORT in .env or index.ts:
```env
PORT=5000
```

### MongoDB Connection Error
- Verify MongoDB is running
- Check MONGODB_URI in .env file
- Ensure database credentials are correct

### TypeScript Compilation Errors
```bash
npm install
npx tsc --version
```

## License
ISC
