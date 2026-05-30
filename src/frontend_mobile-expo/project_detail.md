# Backend Integration Guide: Mobile Portal

> **Target Audience:** Backend Developers
> **Purpose:** This document acts as a technical bridge between the Frontend Mobile (Expo) team and the Backend Developer. It outlines how the mobile app expects to authenticate, what data payloads it sends/receives, and what business logic should reside on the backend.

---

## 1. Authentication Flow

The mobile app relies on a stateless JWT authentication model. It does NOT use cookies like the web dashboard.

### Flow Summary:
1. **Login:** Mobile sends credentials to `/api/auth/driver/login`.
2. **Token Receipt:** Backend returns a JWT `token`.
3. **Storage:** The frontend securely persists this token using `expo-secure-store` (`src/core/api/client.ts`).
4. **Authorized Requests:** The Axios request interceptor automatically attaches the token as `Authorization: Bearer <token>` to all outgoing API calls.
5. **Session Expiry:** If the backend returns a `401 Unauthorized`, the frontend will automatically clear the local token and redirect the user back to the Login screen.

---

## 2. Expected API Endpoints (REST)

Based on the mobile app's mock services (`portal-api.ts`) and expected functionality, the following RESTful endpoints need to be implemented by the backend.

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/driver/login` | Authenticate driver and return JWT. |
| `POST` | `/api/auth/driver/logout` | Invalidate token/session in Redis. |
| `GET`  | `/api/driver/dashboard` | Fetch dashboard statistics (check-ins, pending tasks). |
| `GET`  | `/api/driver/notifications` | Fetch unread/read alerts and push notifications. |
| `GET`  | `/api/driver/appointments` | List appointments (Confirmed, Pending, Waiting) for this driver. |
| `GET`  | `/api/driver/yard-spots` | View yard availability grid map. |
| `POST` | `/api/driver/fcm-token` | Register Firebase Cloud Messaging token for push alerts. |

*(Note: The base URL `EXPO_PUBLIC_API_URL` will prefix these paths).*

---

## 3. Data Models & Payloads

Below are the exact JSON structures the frontend expects to send and receive.

### A. Authentication
**Request (`POST /api/auth/driver/login`)**
```json
{
  "email": "driver@logiport.com",
  "password": "securepassword123"
}
```

**Response**
```json
{
  "code": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "drv_12345",
      "fullName": "Nguyen Van A",
      "truckPlate": "51F-123.45"
    }
  }
}
```

### B. Dashboard Summary
**Request (`GET /api/driver/dashboard`)**
*(Headers: `Authorization: Bearer <token>`)*

**Expected Response**
```json
{
  "code": "success",
  "data": {
    "checkInsToday": 18,
    "freeSpots": 24,
    "pendingTasks": 6,
    "activeAlerts": 3,
    "nextAppointment": "10:30 - Truck 19"
  }
}
```

### C. Appointments
**Request (`GET /api/driver/appointments`)**

**Expected Response**
```json
{
  "code": "success",
  "data": [
    {
      "code": "AP-1024",
      "time": "09:30",
      "truck": "Truck 19",
      "status": "Confirmed" 
    },
    {
      "code": "AP-1026",
      "time": "14:20",
      "truck": "Truck 09",
      "status": "Waiting"
    }
  ]
}
```
*(Note: Valid `status` values are "Confirmed", "Pending", "Waiting")*

### D. Yard Spots
**Request (`GET /api/driver/yard-spots`)**

**Expected Response**
```json
{
  "code": "success",
  "data": [
    { "id": "A-01", "zone": "A", "status": "Free" },
    { "id": "A-02", "zone": "A", "status": "Occupied" },
    { "id": "B-01", "zone": "B", "status": "Reserved" }
  ]
}
```
*(Note: Valid `status` values are "Free", "Occupied", "Reserved")*

---

## 4. Business Logic Handled by Backend

To maintain a thin frontend, the mobile app expects the backend to be the source of truth and handle all complex logic:

1. **Authentication & Session Lock:**
   - Generate secure JWTs.
   - Enforce Single-Session Lock (via Redis token versioning): If a driver logs in on a new device, invalidate the old device's session immediately.
   
2. **AI Computer Vision Integration:**
   - The frontend will NOT talk to the AI cameras. The CV service will send webhooks to the backend (`/api/gate/scan`). The backend is responsible for matching the scanned license plate with the driver's active appointment.
   
3. **State Transitions & Timestamps:**
   - When the AI detects a plate arriving, the backend must transition the appointment status from `Pending` -> `Confirmed` / `Waiting`, and generate a Notification event for the driver.
   
4. **Yard Allocation:**
   - The backend must execute the algorithm (or check availability) to reserve a specific yard spot (`Reserved`) when a truck arrives. The frontend only displays what the backend assigns.

5. **Real-time Push Notifications:**
   - When a gate event happens (e.g., "Xe vào cổng A"), the backend should push the notification to the mobile app (via Firebase Cloud Messaging / APNs, or fallback to SSE/Polling if push is disabled).

6. **Data Aggregation:**
   - The `checkInsToday` and `freeSpots` metrics on the Dashboard must be calculated on the backend database level rather than sending raw lists to the client to count.
