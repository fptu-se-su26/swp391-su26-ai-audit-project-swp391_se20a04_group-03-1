# Frontend Application

## Description
The Frontend Application is built with Next.js 16 and React 19, utilizing TypeScript for type safety and Tailwind CSS for styling. This is a modern, server-side rendered web application with static site generation capabilities.

## Technology Stack
- Runtime: Node.js
- Framework: Next.js 16.2.6
- Library: React 19.2.4
- Language: TypeScript
- Styling: Tailwind CSS 4
- Code Quality: ESLint
- Package Manager: npm

## Directory Structure
```
src/frontend/
├── src/
│   └── app/                 # Next.js App Router
├── public/                  # Static assets
├── node_modules/            # Dependencies
├── .next/                   # Build output
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs       # PostCSS configuration
├── eslint.config.mjs        # ESLint configuration
├── package.json
├── package-lock.json
└── README.md
```

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend root directory:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run the Application

Development (with hot reload):
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

Production Build:
```bash
npm run build
npm run start
```

## Available Scripts

- npm run dev - Start development server with hot reload
- npm run build - Build the application for production
- npm run start - Start production server
- npm run lint - Run ESLint to check code quality

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.6 | React framework with SSR/SSG |
| react | 19.2.4 | JavaScript library for UI |
| react-dom | 19.2.4 | React rendering for web |

## Development Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking and compilation |
| @types/react | React type definitions |
| @types/react-dom | React DOM type definitions |
| @types/node | Node.js type definitions |
| tailwindcss | Utility-first CSS framework |
| @tailwindcss/postcss | PostCSS plugin for Tailwind |
| eslint | Code quality and style checking |
| eslint-config-next | ESLint configuration for Next.js |

## Key Features

- Server-side rendering (SSR)
- Static site generation (SSG)
- Incremental static regeneration (ISR)
- API routes
- Image optimization
- File-based routing (App Router)
- Built-in CSS support with Tailwind CSS
- TypeScript support
- Fast refresh during development

## Project Structure (App Router)

```
src/app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── [slug]/
│   └── page.tsx            # Dynamic routes
└── api/
    └── route.ts            # API endpoints
```

## Development Guidelines

1. Create components in the app directory
2. Use TypeScript for type safety
3. Style components with Tailwind CSS utility classes
4. Follow ESLint rules for code quality
5. Use the built-in Image component for image optimization
6. Leverage server components when possible

## Connecting to Backend API

The frontend communicates with the backend API at http://localhost:4000. Ensure both frontend and backend are running:

Backend:
```bash
cd src/backend
npm run dev
```

Frontend:
```bash
cd src/frontend
npm run dev
```

## Building for Production

```bash
npm run build
npm run start
```

The build output will be optimized and ready for deployment.

## Code Quality

Run ESLint to check for code quality issues:
```bash
npm run lint
```

## Troubleshooting

### Port 3000 is Already in Use
The development server will try to use the next available port automatically, or you can specify a different port:
```bash
npm run dev -- -p 3001
```

### Module Not Found Error
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind CSS Styles Not Applied
Ensure Tailwind CSS is properly configured in tailwind.config.ts and that CSS files are imported in the layout file.

### TypeScript Errors
Run type checking:
```bash
npx tsc --noEmit
```

## Performance Optimization

- Use Next.js Image component for images
- Implement dynamic imports for large components
- Use getStaticProps and getStaticPaths for static generation
- Enable ISR for frequently changing content
- Lazy load components and modules

## Deployment

The application can be deployed to various platforms:
- Vercel (recommended for Next.js)
- AWS
- Azure
- Google Cloud
- Self-hosted servers

Ensure environment variables are properly configured for production.

## License
ISC
