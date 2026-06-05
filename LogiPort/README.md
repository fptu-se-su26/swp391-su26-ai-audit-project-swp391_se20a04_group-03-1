<div align="center">

# 🚢 LogiPort

### Intelligent Port Operations Management Platform

*Streamlining container port logistics with AI-powered vehicle recognition, real-time yard management, and seamless multi-platform experiences.*

---

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-56-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-FF6F00?style=for-the-badge&logo=yolo&logoColor=white)](https://docs.ultralytics.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](./LICENSE)

</div>

---

## 📖 Project Overview

**LogiPort** is a comprehensive, multi-platform port operations management system designed to digitize and automate the workflow of container ports. It addresses the critical challenges of manual gate operations, inefficient yard utilization, and fragmented communication between port administrators, transport companies, and truck drivers.

> **The Problem:** Traditional port operations rely on manual data entry at gate checkpoints, phone-based appointment scheduling, and paper-based Equipment Interchange Reports (EIR) — leading to long wait times, human errors, and operational bottlenecks.

> **The Solution:** LogiPort unifies the entire port lifecycle — from truck appointment scheduling and AI-powered license plate recognition at gate check-in, through real-time yard management, to digital EIR generation — across a web dashboard, a mobile driver app, and a computer vision service.

---

## ✨ Key Features

### 🖥️ Web Dashboard (Admin Portal)
- 📊 **Real-time Dashboard** — Live KPIs for gate throughput, yard occupancy, container counts, and active alerts
- 📅 **Truck Appointment System (TAS)** — Digital scheduling with time-slot management and quota control
- 🚗 **Gate Management** — Check-in/check-out workflow with live AI camera feed integration
- 🏗️ **Yard Management** — Interactive Block-Bay-Row-Tier grid with real-time occupancy tracking
- 📦 **Container Registry** — Full lifecycle tracking for 20ft and 40ft containers
- 📤 **Lift/Lower Records** — Equipment handling logs with operator assignment
- 🔒 **IoT Seal Monitoring** — Temperature and humidity surveillance for sealed containers
- 📈 **Analytics & Reports** — Hourly traffic charts, container distribution, dwell-time analysis, and revenue reports

### 📱 Mobile App (Driver Portal)
- 🏠 **Driver Dashboard** — At-a-glance summary of check-ins, free spots, and pending tasks
- 🔔 **Push Notifications** — Real-time alerts for gate entry, appointment confirmations, and spot assignments
- 📋 **Appointment Manager** — View, filter, and track upcoming appointment statuses
- 📍 **Yard Navigator** — Zone-based spot finder with availability indicators
- 📷 **QR Code System** — Generate and present QR codes for contactless gate check-in
- ⚙️ **Settings & Profile** — Account management and preferences

### 🤖 AI / Computer Vision
- 🔍 **License Plate Recognition (ANPR)** — YOLO v8 object detection + EasyOCR text extraction
- 📦 **Container Code Detection** — Automated ISO container code scanning
- 📹 **Live Video Feed** — Real-time MJPEG camera stream with AI annotations rendered in-browser
- 🔗 **Webhook Integration** — Automatic event dispatch to backend with intelligent cooldown de-duplication
- 🩺 **Health Diagnostics** — Model loading status, camera connectivity, and backend webhook health checks

---

## 🛠️ Tech Stack Ecosystem

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Frontend** | Next.js | 16.2 | React meta-framework with SSR/SSG |
| | React | 19.2 | Declarative UI library |
| | TypeScript | 5.x | Static type safety |
| | Tailwind CSS | 4.x | Utility-first styling |
| | shadcn/ui + Radix | Latest | Accessible component primitives |
| | Zustand | 5.x | Lightweight state management |
| | TanStack Query | 5.x | Async server-state management |
| | Framer Motion | 12.x | Animation library |
| | Zod | 4.x | Schema validation |
| **Backend** | Express.js | 5.x | REST API framework |
| | TypeScript | 5.x | Server-side type safety |
| | MongoDB + Mongoose | 9.x | NoSQL document database & ODM |
| | Redis | 5.x | Session store, OTP cache, rate limiting |
| | JWT (jsonwebtoken) | 9.x | Token-based authentication |
| | bcryptjs | 3.x | Password hashing |
| | Joi | 18.x | Request payload validation |
| | Nodemailer | 8.x | Transactional email (OTP delivery) |
| **Mobile** | React Native | 0.85 | Cross-platform native app |
| | Expo SDK | 56 | Managed development workflow |
| | React Navigation | 7.x | Stack + Bottom Tab navigation |
| | TanStack Query | 5.x | Data fetching & caching |
| | Zustand | 5.x | Client-side state |
| | React Native Reanimated | 4.x | Performant animations |
| | React Native Paper | 5.x | Material Design components |
| | expo-camera | 56.x | QR scanning & camera access |
| **AI / CV** | Python | 3.x | AI service runtime |
| | Flask + Flask-CORS | Latest | Lightweight API server |
| | Ultralytics (YOLOv8) | Latest | Object detection model |
| | EasyOCR | Latest | Optical character recognition |
| | OpenCV | Latest | Image processing & video capture |
| **Infrastructure** | Docker Compose | — | Multi-container orchestration |
| | Nginx | — | Reverse proxy & load balancing |

---

## 📂 Project Structure

```text
LogiPort/
├── frontend/                  # 🖥️  Next.js 16 Admin Dashboard
│   ├── src/
│   │   ├── app/               # App Router pages & layouts
│   │   │   ├── admin/         # Auth, Dashboard, Gate, Yard, Containers, etc.
│   │   │   └── page.tsx       # Landing page
│   │   ├── components/        # Reusable UI & layout components
│   │   ├── lib/               # Utilities, hooks, theme provider
│   │   └── middleware.ts      # Route-level auth guard
│   └── package.json
│
├── backend/                   # ⚙️  Express.js 5 REST API
│   ├── config/                # Database (MongoDB) & Redis connection
│   ├── controllers/           # Business logic handlers
│   ├── middlewares/            # JWT auth verification middleware
│   ├── models/                # Mongoose schemas (AccountAdmin, etc.)
│   ├── routers/               # Express route definitions
│   ├── validators/            # Joi validation schemas
│   ├── helpers/               # Mail helper (Nodemailer)
│   ├── index.ts               # Server entry point (port 4000)
│   └── package.json
│
├── mobile-expo/               # 📱 React Native (Expo SDK 56) Driver App
│   ├── src/
│   │   ├── screens/           # Dashboard, Appointments, QR, Yard, Settings, Notifications
│   │   ├── navigation/        # Stack + Bottom Tab navigator
│   │   ├── components/        # UI, Layout, QR components
│   │   ├── services/          # API client layer
│   │   ├── theme/             # Design tokens & color palette
│   │   └── types/             # TypeScript interfaces
│   ├── app.json               # Expo configuration
│   └── package.json
│
├── computer-vison/            # 🤖 Python AI / ANPR Microservice
│   ├── models/                # YOLO weight files (.pt)
│   ├── src/
│   │   ├── app.py             # Flask server with live video endpoints
│   │   ├── config.py          # Environment-based configuration
│   │   └── services/
│   │       ├── ai_processor.py   # YOLO + EasyOCR detection pipeline
│   │       └── api_client.py     # Backend webhook client with cooldown
│   ├── tests/                 # Test suite
│   └── requirements.txt
│
├── infrastructure/            # 🐳 DevOps & Deployment
│   ├── docker-compose.yml     # Full-stack local orchestration
│   └── nginx.conf             # Reverse proxy configuration
│
└── README.md                  # ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Download |
|:-----|:--------|:---------|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org/) |
| Python | ≥ 3.9 | [python.org](https://www.python.org/) |
| MongoDB | ≥ 7.x | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Redis | ≥ 7.x | [redis.io](https://redis.io/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/logiport.git
cd logiport/LogiPort
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env   # (or create .env manually)
```

Configure `.env`:

```env
PORT=4000
DATABASE=mongodb://localhost:27017/logiport
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

```bash
npm run dev
# ✅ Server running at http://localhost:4000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
```

```bash
npm run dev
# ✅ Dashboard available at http://localhost:3000
```

### 4. Mobile App Setup

```bash
cd mobile-expo
npm install
npx expo start
# 📱 Scan QR code with Expo Go app on your device
```

### 5. AI / Computer Vision Service

```bash
cd computer-vison
pip install -r requirements.txt

# Place your YOLO weights in the models/ directory (best.pt)
python src/app.py
# 🤖 CV Service running at http://localhost:5001
```

### 6. One-Command Launch (Docker)

```bash
cd infrastructure
docker compose up -d
# 🚀 All services orchestrated via Docker
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Purpose |
|:-------|:--------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation change |
| `style:` | Code formatting (no logic change) |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Build process or tooling changes |

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the SE20A04 Group 03 Team**

*FPT University — SWP391 — Summer 2026*

</div>
