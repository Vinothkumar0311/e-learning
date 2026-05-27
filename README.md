# 🎓 EduAdmin — Full-Stack E-Learning Platform

A complete, production-ready e-learning platform with a **React Admin Dashboard**, **Node.js REST API**, and a **Flutter Mobile App** for students. Supports the full enrollment lifecycle from course browsing to payment verification and content access.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Admin Dashboard (Web)](#admin-dashboard-web)
  - [Student App (Mobile)](#student-app-mobile)
  - [Backend API](#backend-api)
- [Financial & Enrollment Workflow](#financial--enrollment-workflow)
- [Access Control & Suspension Logic](#access-control--suspension-logic)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Server](#2-backend-server)
  - [3. Admin Frontend](#3-admin-frontend)
  - [4. Student Mobile App](#4-student-mobile-app)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Connecting Mobile to Local Server](#connecting-mobile-to-local-server)
- [Folder Structure](#folder-structure)
- [License](#license)

---

## Overview

**EduAdmin** is a full-stack e-learning management system built for institutions and independent educators. It provides:

- An **Admin Web Dashboard** to manage courses, students, enrollments, and payments.
- A **Student Mobile App** (Flutter) to browse courses, request enrollment, submit payment proof, and access course content.
- A **REST API** backend to connect both apps through a unified, role-separated authentication system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Admin Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend API** | Node.js, Express 5, Sequelize ORM, MySQL |
| **Student App** | Flutter (Dart), Provider, GoRouter, Dio |
| **Authentication** | JWT (separate tokens for Admin users and Students) |
| **File Uploads** | Multer (payment proof screenshots) |
| **Email** | Nodemailer (SMTP) |

---

## Project Structure

```
e-learning/
├── server/          # Node.js + Express REST API
├── frontend/        # React Admin Dashboard (Vite)
└── student_app/     # Flutter Student Mobile App
```

---

## Features

### Admin Dashboard (Web)

| Page | Description |
|---|---|
| **Dashboard** | KPI cards, enrollment graphs, revenue charts, recent activity |
| **Courses** | Create, edit, publish/unpublish courses with sections & modules |
| **Students** | Browse all registered students with status and contact info |
| **Enrollment Requests** | Multi-step pipeline: Review → Approve → Set Fee → Verify Payment → Enroll |
| **Verify Payments** | Review uploaded payment proof screenshots; approve or reject |
| **Payments & Revenue** | Real-time dashboards featuring dynamic financial metrics, active transaction logs, export capabilities, and custom balance payment request tools |
| **Live Classes** | Manage scheduled live sessions per course |
| **Materials** | Upload and manage supplementary course materials |
| **Notifications** | Send notifications to students |
| **Reports** | Revenue and enrollment analytics with charts |
| **Settings** | Platform configuration |

### Student App (Mobile)

| Screen | Description |
|---|---|
| **Splash** | Auto-login check; routes to home or login |
| **Login / Register** | JWT-based student authentication |
| **Home** | Search bar, promotional banner, 2-column course grid (enrolled courses automatically hidden) |
| **Course Detail** | Course info, instructor, sections list; automatic fee-hiding upon purchase; adaptive full-width action buttons; inline payment request warnings & proof upload shortcuts |
| **Cart** | Add/remove courses; checkout to create enrollment request |
| **Enrollment Status** | 8-step progress tracker; smart active-pending payment parser with instant UPI receipt upload |
| **My Courses** | List of fully enrolled courses with access to content |
| **Live Classes** | Upcoming and past live sessions |
| **Materials** | Download course materials |
| **Notifications** | Admin-sent notifications |
| **Profile** | Student info, logout |

### Backend API

- **Dual-role JWT authentication** — separate `protect` (Admin) and `studentProtect` (Student) middleware
- **Enrollment state machine** — strict 8-step status workflow with automated pricing propagation
- **Payment management** — proof upload via Multer, audit log on every action
- **Auto-enrollment** — free courses are enrolled instantly on admin approval
- **Rate limiting** — `express-rate-limit` on all API routes
- **Input validation** — `express-validator` on auth and form routes
- **CORS** configured for local dev and production

---

## Financial & Enrollment Workflow

The platform implements an advanced, admin-controlled **Installment & Financial State Machine**:

```
           Student Request
                 │
                 ▼
            [1] Pending          ← Student submits enrollment from cart
                 │
                 ▼
           [2] Reviewing        ← Admin reviews the request
                 │
                 ▼
            [3] Approved         ← Admin approves / AmountAssigned (fee set)
                 │
                 ▼
       [4] Payment Pending       ← Awaiting student's payment (Initial or Custom installment)
                 │
                 ▼
      [5] Payment Submitted      ← Student uploads payment proof screenshot
                 │
                 ▼
       [6] Payment Verified      ← Admin verifies receipt (automatic paid_amount incrementation)
                 │
                 ▼
         Are Dues Clear?
          /           \
        YES            NO
        /                \
       ▼                  ▼
 [7] Enrolled ✅    [7] Enrolled (Partially Paid) ⏳
(Full Access)       (Conditional access, balance remaining)
```

### Installment Features:
1. **Dynamic Balance Tracking**: Every enrollment maintains a `final_amount` and `paid_amount`. The system dynamically computes:
   `remaining_amount = final_amount - paid_amount`
2. **Custom Balance Payment Requests**: Admins can issue custom payment requests (e.g. for the remaining due or custom installment steps) via the dashboard. This spawns a new pending payment record, instantly allowing students to tap and upload receipt proofs in their app.
3. **Adaptive Mobile UX**: If a student is enrolled in a course, all public tuition fee tags are **hidden** from the detail screens, and the continue learning button expands to full-width. If an outstanding balance remains, a dedicated gold banner provides an inline **receipt upload** action shortcut.

---

## Access Control & Suspension Logic

For enrollments in a **Partially Paid** state (outstanding dues), admins have fine-grained access control:
* **Suspension Trigger**: Admins can block student access to specific courses via the Enrollment Requests page in a single click, providing a custom block reason.
* **Instant Lockout**: The student's mobile app instantly blocks premium course lessons and displays an alert showing the exact suspension reason and their outstanding payment details.
* **Access Restoration**: Once the outstanding balance is verified or manually cleared, the admin can unblock access to instantly restore lesson playbacks.

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **Flutter** 3.x SDK
- **Android Studio** / **Xcode** (for mobile development)
- `adb` (Android Debug Bridge) for USB device testing

---

### 1. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE elearning_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sequelize will auto-sync all tables on first server start (`sync({ alter: true })`).

Seed the default admin user:

```bash
cd server
npm run seed
```

---

### 2. Backend Server

```bash
cd server
cp .env.example .env
# Fill in your DB credentials and JWT secret in .env
npm install
npm run dev
```

Server starts at **`http://localhost:5000`**

---

### 3. Admin Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard opens at **`http://localhost:5173`**

---

### 4. Student Mobile App

```bash
cd student_app
flutter pub get
```

**For a physical Android device:**

To support reliable debugging on physical devices over USB without DNS Lookup failures (`Failed host lookup: 'localhost'`), the app utilizes the `127.0.0.1` loopback:

```bash
# Step 1: Connect device via USB (enable USB Debugging)
adb devices

# Step 2: Forward the local server port to the physical device
adb reverse tcp:5000 tcp:5000

# Step 3: Run the Flutter app
flutter run
```

For **Android Emulators**, set `baseUrl` in `student_app/lib/core/constants/app_constants.dart` to:
```dart
static const String baseUrl = 'http://10.0.2.2:5000/api';
```

---

## Environment Variables

Create `server/.env` based on `.env.example`:

```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=elearning_db
DB_DIALECT=mysql

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h

# SMTP (Optional - for email notifications)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@eduadmin.com
FROM_NAME=EduAdmin
```

---

## API Reference

All routes are prefixed with `/api`.

### Auth — Admin

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/login` | Admin login → returns JWT |

### Auth — Student

| Method | Route | Description |
|---|---|---|
| `POST` | `/student/register` | Student registration |
| `POST` | `/student/login` | Student login → returns JWT |
| `GET` | `/student/me` | Get current student profile |
| `GET` | `/student/my-enrollments` | Student's enrollment list with payment info |

### Courses

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/courses` | Public | List all published courses (excludes enrolled) |
| `GET` | `/courses/:id` | Public | Get single course with sections |
| `POST` | `/courses` | Admin | Create a course |
| `PUT` | `/courses/:id` | Admin | Update a course |
| `DELETE` | `/courses/:id` | Admin | Delete a course |
| `POST` | `/courses/:id/sections` | Admin | Add section to course |
| `POST` | `/courses/:id/modules` | Admin | Add module/lesson |

### Enrollments

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/enrollments` | Admin | List all enrollments (paginated, filterable) |
| `GET` | `/enrollments/pending` | Admin | Pending enrollments only |
| `POST` | `/enrollments` | Student | Create enrollment request via cart checkout |
| `PATCH` | `/enrollments/:id/status` | Admin | Update enrollment status |
| `PATCH` | `/enrollments/:id/approve` | Admin | Approve request (auto-creates payment record) |
| `POST` | `/enrollments/:id/reject` | Admin | Reject enrollment |
| `POST` | `/enrollments/:id/record-payment` | Admin | Record manual cash/partial payment |
| `POST` | `/enrollments/:id/request-payment` | Admin | Issue custom balance/installment payment request |
| `PATCH` | `/enrollments/:id/block` | Admin | Toggle course-level block and suspension |

### Payments

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/payments` | Admin | Real-time payment analytics and audit ledger |
| `PATCH` | `/payments/:id/verify` | Admin | Verify/reject a payment proof screenshot |
| `POST` | `/payments/:id/proof` | Student | Upload payment proof screenshot |

---

## Database Models

| Model | Key Fields |
|---|---|
| `User` | id, name, email, password, role, isActive |
| `Student` | id, name, email, phone, password, isActive |
| `Course` | id, title, description, price, thumbnail, isPublished, instructorName |
| `CourseSection` | id, course_id, title, order |
| `CourseModule` | id, section_id, title, content_type, content_url, duration, is_free |
| `Enrollment` | id, student_id, course_id, status, request_status, fee_status, payment_status, final_amount, paid_amount, is_blocked, block_reason |
| `Payment` | id, enrollment_id, student_id, amount, status, method, payment_mode, transaction_ref, proof_url |
| `PaymentAuditLog` | id, payment_id, action, performed_by, notes |
| `Cart` | id, student_id |
| `CartItem` | id, cart_id, course_id, price_at_add |
| `LiveClass` | id, course_id, title, scheduled_at, meet_url |
| `Material` | id, course_id, title, file_url, file_type |
| `Notification` | id, student_id, title, message, is_read |

---

## Connecting Mobile to Local Server

When running on a **physical Android device** via USB:

```bash
# Step 1: Connect device via USB (enable USB Debugging)
adb devices

# Step 2: Forward port so device can reach your laptop's server
adb reverse tcp:5000 tcp:5000

# Step 3: Run the Flutter app
cd student_app
flutter run
```

> If you disconnect and reconnect USB, re-run `adb reverse tcp:5000 tcp:5000`.

When running on an **Android Emulator**, use `10.0.2.2` instead of `127.0.0.1`:
```dart
static const String baseUrl = 'http://10.0.2.2:5000/api';
```

---

## License

This project is proprietary software developed for **MobileKI**. All rights reserved.
