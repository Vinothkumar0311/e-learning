# 🎓 EduAdmin — Full-Stack E-Learning Platform

A complete, production-ready e-learning platform with a **React Admin Dashboard**, **Node.js REST API**, and a **Flutter Mobile App** for students. Supports the full student lifecycle — from admin-controlled course assignment and enrollment through payment verification, video streaming, document viewing, in-app progress tracking, and course-level access suspension.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Admin Dashboard (Web)](#admin-dashboard-web)
  - [Student App (Mobile)](#student-app-mobile)
  - [Backend API](#backend-api)
- [Student Admission Workflow](#student-admission-workflow)
- [Financial & Enrollment Workflow](#financial--enrollment-workflow)
- [Access Control & Suspension Logic](#access-control--suspension-logic)
- [Syllabus Progress & Performance Tracking Workflow](#syllabus-progress--performance-tracking-workflow)
- [In-App PDF Viewer Integration](#in-app-pdf-viewer-integration)
- [Notifications Center](#notifications-center)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup & Seeding](#1-database-setup--seeding)
  - [2. Backend Server](#2-backend-server)
  - [3. Admin Frontend](#3-admin-frontend)
  - [4. Student Mobile App](#4-student-mobile-app)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Connecting Mobile to Local Server](#connecting-mobile-to-local-server)
- [License](#license)

---

## Overview

**EduAdmin** is a full-stack e-learning management system designed for institutions and independent educators. The platform uses an **admin-assigned enrollment model** — students are directly admitted and assigned courses by administrators, rather than self-enrolling.

- **Admin Web Dashboard** — Create and manage courses, admit students, assign courses, track progress analytics, verify payments, and suspend course access.
- **Student Mobile App** (Flutter) — Log in with admin-issued credentials, view assigned courses, stream video lessons, read PDFs in-app, complete modules to log progress, and track overall syllabus analytics.
- **REST API** — Connects both systems via a unified, dual-role JWT authentication system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Admin Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts (Charts), Lucide Icons, Sonner |
| **Backend API** | Node.js, Express 5, Sequelize ORM, MySQL, Multer (file uploads), Nodemailer |
| **Student App** | Flutter (Dart), Provider (State Management), GoRouter, Dio (HTTP Client), CachedNetworkImage, flutter_cached_pdfview |
| **Authentication** | JWT — separate middleware for Admin (`protect`) and Students (`studentProtect`) |
| **Media Streaming** | YouTube Player Flutter with fullscreen support, auto-next, and gesture controls |

---

## Project Structure

```
e-learning/
├── server/          # Node.js + Express REST API
│   ├── controllers/ # Route handlers (auth, courses, progress, notifications, etc.)
│   │   ├── progressController.js      # Mark progress & calculate performance leaderboard
│   │   ├── notificationController.js  # Dispatch broadcasts & view logs
│   │   └── ...
│   ├── models/      # Sequelize ORM models
│   │   ├── StudentAssignedCourse.js   # Stores student-course gateway assignments
│   │   ├── StudentProgress.js         # Tracks completed modules per student
│   │   └── ...
│   ├── routes/      # Express routers
│   │   ├── notifications.js           # Admin broadcast endpoint router
│   │   ├── performance.js             # Admin leaderboard and student metrics router
│   │   └── ...
│   ├── middleware/  # JWT auth & role guards
│   ├── seeders/     # DB seed scripts
│   │   └── dbSeedMaster.js            # Recommended database master seed script
│   └── uploads/     # Uploaded thumbnails, materials (PDFs), & payment proofs
├── frontend/        # React Admin Dashboard (Vite)
│   └── src/
│       ├── pages/   # Dashboard, Courses, Students, Admissions, Performance, etc.
│       │   ├── Admissions.jsx         # Direct admission & manual course assigning
│       │   ├── Performance.jsx        # Admin analytics panel & syllabus leaderboard
│       │   └── ...
│       └── components/
└── student_app/     # Flutter Student Mobile App
    └── lib/
        ├── screens/ # Auth, Courses, Video Player, PDF Viewer, Performance, etc.
        │   ├── courses/pdf_viewer_screen.dart   # In-app PDF view & progress updater
        │   ├── performance/performance_screen.dart # Student learning analytics screen
        │   └── ...
        ├── providers/
        │   ├── progress_provider.dart # Manages progress logging & summary state
        │   └── ...
        ├── models/
        │   ├── progress_model.dart    # Maps performance summaries and checklists
        │   └── ...
        └── services/
            ├── progress_service.dart  # Connects to backend progress endpoints
            └── ...
```

---

## Features

### Admin Dashboard (Web)

| Page / Component | Description |
|---|---|
| **Dashboard** | KPI cards, enrollment graphs, revenue charts, recent activity, and upcoming live classes. |
| **Courses** | Full CRUD course builder: create, edit, publish/unpublish courses with nested sections, sub-sections, and video/quiz/PDF modules. |
| **Students** | Browse all registered students; toggle active/inactive status. |
| **Admissions** | Admin-controlled student admission panel: create a student account with auto-generated credentials (Full Name as username, Mobile Number as password), copy login credentials templates, toggle student status, and assign/remove courses directly. |
| **Performance Analytics** | Monitor global average progress, total modules completed, leaderboard top performer, and average watch time. Displays course engagement charts (Recharts) and an expandable student syllabus leaderboard with checklist-style lesson audits. |
| **Enrollment Requests** | Multi-step pipeline: Review → Approve → Set Fee → Verify Payment → Enroll. Includes a one-click block/unblock toggle per enrollment. |
| **Verify Payments** | View uploaded payment screenshots; verify receipt details to approve or reject with comments. |
| **Payments & Revenue** | Financial dashboards with transaction ledgers, CSV export, and manual billing entries. |
| **Notifications Center** | Dynamic composer with multi-channel broadcast (Push, Email, SMS). Includes an interactive mobile device simulator to preview notification cards before dispatch. |
| **Live Classes** | Schedule and launch interactive live classrooms (Google Meet, Zoom, etc.) for selected batches. |
| **Materials** | Upload and manage supplementary documents (PDFs, docs, zips) associated with courses. |
| **Settings** | Portal configuration controls. |

### Student App (Mobile)

| Screen | Description |
|---|---|
| **Splash Screen** | Auto-login validator; routes users to Home or Auth screens. |
| **Login** | Dual-mode login: **Name + Mobile Number** (for admin-admitted students) or **Email + Password** (for self-registered students). |
| **My Performance** | Displays an advanced learning analytics dashboard: a gradient summary card (showing overall syllabus completion %, total courses, modules done, and hours watched) and an expandable list of enrolled courses with checkbox-style lesson checklists. |
| **Course Discovery** | Browse published courses not yet assigned, with search bar and promotional banner. |
| **My Courses** | Displays all admin-assigned courses. Shows a **green "Enrolled" badge** for active courses and a **red "Blocked" badge** with a lock button for suspended courses. |
| **Course Details** | Full section/sub-section curriculum browser. Shows block status banner if access is suspended; shows video/module tiles with free/premium indicators. |
| **Video Player** | Built-in YouTube player with fullscreen toggle, auto-next lecture, section navigation list, and an instant **"ACCESS SUSPENDED"** screen that activates when a course is blocked. Automatically logs progress on module completion. |
| **PDF Viewer** | Dedicated in-app PDF document reader. Integrates local caching, custom page navigation indicators, retry triggers, and automatically logs module completion on document load. |
| **Cart & Checkout** | Multi-course cart with bulk checkout and enrollment request submission. |
| **Admissions Tracker** | Real-time 8-step enrollment status tracker with UPI payment proof upload. |
| **Profile** | View student profile, enrolled course list, and secure session logout. |

### Backend API

- **Dual-role JWT authentication** — separate `protect` (Admin) and `studentProtect` (Student) middleware.
- **Admin Admission & Assign Gate** — Admins create students with credentials and assign courses via `StudentAssignedCourse`. The access guard ensures students can only fetch details for courses they are explicitly assigned.
- **In-App Progress Logging** — Keeps track of completed modules (videos, PDFs) per student using `StudentProgress`. Includes uniqueness index on `(student_id, module_id)` to prevent duplicates.
- **Access Guard** — `getCourse` and `getMyCourses` enforce that students can only view courses they've been explicitly assigned.
- **Enrollment Auto-Provisioning** — On first course access, a corresponding `Enrollment` record is automatically created via `findOrCreate`, enabling the admin to manage block/payment status immediately.
- **Financial State Machine** — Automated dues calculations, partial payment increments, and balance tracking per enrollment.
- **Course-Level Access Suspension** — Admins can block/unblock a student's access to a specific course. The block status is injected into every course detail and my-courses API response.
- **Notification Dispatch Engine** — Handles logs, scheduled schedules, and targeted recipient groupings (All, Enrolled, Dues Pending).

---

## Student Admission Workflow

The platform uses an **admin-controlled admission model**. Students do not self-register for courses — they are admitted and assigned by the admin.

```
Admin Action
     │
     ▼
[1] Create Student Account
     Admin provides: Name, Email (optional), Mobile Number
     System auto-generates: Username = Full Name, Password = Mobile Number
     │
     ▼
[2] Assign Course(s)
     Admin selects one or more courses from the catalog (creates StudentAssignedCourse)
     │
     ▼
[3] Student Logs In (Mobile App)
     Credentials: Full Name (Username) + Mobile Number (Password)
     │
     ▼
[4] Student Accesses Assigned Course
     Backend auto-creates an Enrollment record on first access
     Admin can now manage block status and payment for this enrollment
```

### Student Login Credentials (Admin-Created Students)
- **Username**: Student's Full Name (e.g., `Vinothkumar S`) - case-insensitive
- **Password**: Student's Mobile Number (e.g., `9876543210`)

---

## Financial & Enrollment Workflow

The platform implements an admin-controlled **Installment & Financial State Machine**:

```
           Student Request (Cart Checkout)
                 │
                 ▼
            [1] Pending          ← Student submits enrollment request
                 │
                 ▼
            [2] Reviewing        ← Admin reviews the request
                 │
                 ▼
            [3] Approved         ← Admin approves / AmountAssigned (fee set)
                 │
                 ▼
        [4] Payment Pending       ← Awaiting student's payment
                 │
                 ▼
       [5] Payment Submitted      ← Student uploads payment proof screenshot
                 │
                 ▼
        [6] Payment Verified      ← Admin verifies receipt (paid_amount incremented)
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

### Installment Features
1. **Dynamic Balance Tracking**: Every enrollment maintains `final_amount` and `paid_amount`. The system dynamically computes `remaining_amount = final_amount - paid_amount`.
2. **Custom Installment Requests**: Admins can issue custom payment requests for remaining dues via the dashboard, spawning a new pending payment record for the student to upload proof against.
3. **Adaptive Mobile UX**: Once enrolled, all public tuition fee tags are hidden. If an outstanding balance remains, a dedicated banner provides an inline receipt upload shortcut.

---

## Access Control & Suspension Logic

Admins have fine-grained, per-enrollment course access control:

- **Suspension Trigger**: Click the block toggle on any enrollment from the Enrollment Requests page, providing an optional custom reason.
- **Instant Lockout**: The student's mobile app reflects the block immediately:
  - **My Courses Screen**: Shows a red "Blocked" badge and a red lock button. Tapping either shows an `AlertDialog` with the suspension reason.
  - **Course Detail Screen**: Displays a red "COURSE ACCESS SUSPENDED" banner with the reason and any outstanding payment details.
  - **Video Player Screen**: Immediately replaces the player with a full "ACCESS SUSPENDED" screen, completely preventing lesson access.
- **Access Restoration**: Admin unblocks the enrollment to instantly restore full access. The mobile app reflects this in real-time on next data refresh.

---

## Syllabus Progress & Performance Tracking Workflow

Student learning progress is tracked automatically and visualized in real-time for both students and administrators.

```
          Student Activity (Mobile App)
            /                        \
           ▼                          ▼
   Finishes Video Lesson        Loads Material PDF
           \                          /
            ▼                        ▼
      Mark Completed (POST /api/student/progress/mark)
                     │
                     ▼
          Update StudentProgress Record
                     │
                     ▼
     Calculates Course & Overall Completion %
            /                        \
           ▼                          ▼
   My Performance Screen      Admin Performance Dashboard
  (Student Progress Charts)    (Leaderboard & Checklist Audits)
```

1. **Auto-Logging Progress**: 
   - **Videos**: As soon as a student completes watching a video module inside the YouTube player, the app triggers a progress update.
   - **PDF Materials**: When a student opens any document module, it launches the in-app PDF viewer and logs progress to the backend.
2. **Student-Side Analytics**: Visualized inside the **My Performance** tab, showing overall completion rate, course breakdowns, and checklists.
3. **Admin-Side Leaderboard**: Active students are ranked by overall module completions, providing teachers with course-level completion percentages, total watch times, and full module checkboxes.

---

## In-App PDF Viewer Integration

The mobile application features a built-in PDF document reader, eliminating the need to redirect students to external web browsers.

- **Remote Caching**: Uses `flutter_cached_pdfview` to download and cache remote PDF documents, ensuring fast page load times on subsequent viewings.
- **Download Progress**: Shows a clean visual progress indicator displaying download percentages.
- **Error Handling**: Implements a dedicated error layout with an inline "Try Again" trigger to handle network drops gracefully.
- **Page Controls**: Implements floating navigation overlays for page flipping (`Prev / Next`) and real-time page count indicators (`Page X of Y`).
- **Autologging**: Upon successful document render, the viewer automatically dispatches a completion callback to sync the student's progress.

---

## Notifications Center

EduAdmin features an advanced **Notifications Center**:

- **Multi-Channel Dispatch**: Broadcast via **Push Notification**, **Email Campaign**, or **SMS Alert** modes.
- **Smart Targeting**: Send to *All Registered Students*, *Enrolled Students Only*, *Students with Outstanding Balances*, or specific course batches.
- **Interactive Simulator**: The admin portal embeds a high-fidelity mobile device notch mockup. As admins type, a live simulation previews the notification as the student will receive it.
- **Broadcast History Logs**: Audit all sent messages with timestamp, channel, recipient group, and status.

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **Flutter** 3.x SDK
- **Android Studio** / **Xcode** (for mobile development)
- `adb` (Android Debug Bridge) for USB device testing

---

### 1. Database Setup & Seeding

Create the MySQL database:

```sql
CREATE DATABASE elearning_db1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sequelize will auto-sync all tables on first server start (`sync({ alter: true })`).

#### Seeding Database

**Option A: Basic Setup (Super Admin Only)**
```bash
cd server
npm run seed
```
- **Super Admin Credentials**: `admin@eduadmin.com` / `admin123`

**Option B: Full Sandbox Curriculum Seed (Recommended)**

Drops all tables, reconstructs the schema, and seeds a complete workspace with 3 courses (DSA, React & Next.js, Node.js), nested sections/subsections, YouTube-linked lessons, a default student profile, and super admin access:

```bash
cd server
node seeders/dbSeedMaster.js
```

- **Super Admin**: `admin@eduadmin.com` / `admin123`
- **Default Student** (email login): `svinothkumar0301@gmail.com` / `123456`
- **Admin-Admitted Students** (name login): Full Name + Mobile Number (set at admission time)

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

**For a physical Android device (recommended):**

```bash
# Step 1: Connect device via USB (enable USB Debugging)
adb devices

# Step 2: Forward the local server port to the device
adb reverse tcp:5000 tcp:5000

# Step 3: Run the app
flutter run
```

**For an Android Emulator**, the app is already pre-configured to use `10.0.2.2`. If needed, verify `student_app/lib/core/constants/app_constants.dart`:
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
DB_NAME=elearning_db1
DB_DIALECT=mysql

# JWT Keys
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h

# SMTP Config (Optional - for email notifications)
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

### 🔐 Auth (Admin)

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Admin login → returns JWT |
| `GET` | `/auth/me` | Admin | Get current admin profile |

---

### 👨‍🎓 Student Endpoints

#### Authentication
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/student/register` | Public | Self-service student registration |
| `POST` | `/student/login` | Public | Student login (name+password or email+password) → returns JWT |
| `GET` | `/student/me` | Student | Get current student profile |

#### Course Discovery & Content
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/student/courses` | Public | List published courses (excludes already-assigned) |
| `GET` | `/student/courses/:id` | Student | Get single course with sections, modules, and block status |
| `GET` | `/student/my-courses` | Student | List all admin-assigned courses with block & payment status |
| `GET` | `/student/courses/:id/materials` | Student | Download supplementary course documents |

#### Shopping Cart Flow
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/student/cart` | Student | View current shopping cart |
| `POST` | `/student/cart/add` | Student | Add course to cart |
| `DELETE` | `/student/cart/:id` | Student | Remove course from cart |
| `POST` | `/student/cart/checkout` | Student | Checkout and submit enrollment request |

#### Enrollments & Payments
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/student/enroll` | Student | Request direct enrollment |
| `GET` | `/student/my-enrollments` | Student | Student's enrollment list with status |

#### Progress & Syllabus Metrics
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/student/progress/mark` | Student | Mark a course module (video/PDF) as completed |
| `GET` | `/student/progress/:courseId` | Student | Get completed module IDs for a course |
| `GET` | `/student/performance` | Student | Get overall progress statistics and syllabus checklist |

---

### 🛠️ Admin Course Management

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/courses` | Admin | List all courses (includes drafts) |
| `POST` | `/courses` | Admin | Create a new course |
| `GET` | `/courses/:id` | Admin | Get course details |
| `PUT` | `/courses/:id` | Admin | Update course metadata |
| `DELETE` | `/courses/:id` | Admin | Delete course |
| `POST` | `/courses/upload` | Admin | Upload course thumbnail / files |
| `GET` | `/courses/:courseId/sections` | Admin | Get all sections in course |
| `POST` | `/courses/:courseId/sections` | Admin | Create a course section |
| `PUT` | `/courses/:courseId/sections/:id` | Admin | Update section details |
| `DELETE` | `/courses/:courseId/sections/:id` | Admin | Delete section |
| `GET` | `/courses/:courseId/modules` | Admin | Get modules in course |
| `POST` | `/courses/:courseId/modules` | Admin | Create a module (lesson/video/document) |
| `PUT` | `/courses/:courseId/modules/:id` | Admin | Update module details |
| `DELETE` | `/courses/:courseId/modules/:id` | Admin | Delete module |

---

### 👥 Student Directory & Admissions (Admin)

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/students` | Admin | List all student accounts |
| `POST` | `/students/create` | Admin | **Admit a new student** with auto-generated credentials |
| `GET` | `/students/:id` | Admin | View student profile & details |
| `PUT` | `/students/:id` | Admin | Edit student profile |
| `DELETE` | `/students/:id` | Super Admin | Remove student account |
| `PATCH` | `/students/:id/toggle-status` | Admin | Suspend or reactivate student account |
| `POST` | `/students/:id/assign-courses` | Admin | **Assign one or more courses** to a student |
| `GET` | `/students/:id/assigned-courses` | Admin | View all course assignments for a student |
| `DELETE` | `/students/:id/assigned-courses/:courseId` | Admin | Remove a course assignment |
| `GET` | `/students/:id/performance` | Admin | Fetch course progress breakdown for a specific student |

---

### 💳 Admin Enrollment & Payment Management

#### Enrollments
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/enrollments` | Admin | List all enrollment requests (paginated) |
| `GET` | `/enrollments/pending` | Admin | Fetch pending enrollment requests only |
| `GET` | `/enrollments/:id` | Admin | View details of an enrollment |
| `PATCH` | `/enrollments/:id/status` | Admin | Update enrollment status |
| `PATCH` | `/enrollments/:id/set-amount` | Admin | Assign tuition fee to enrollment |
| `POST` | `/enrollments/:id/approve` | Admin | Approve request (creates pending payment) |
| `POST` | `/enrollments/:id/reject` | Admin | Reject request |
| `POST` | `/enrollments/:id/record-payment` | Admin | Record manual cash/check payment |
| `POST` | `/enrollments/:id/request-payment` | Admin | Issue custom installment payment request |
| `PATCH` | `/enrollments/:id/block` | Admin | **Toggle course access block** (with optional reason) |

#### Payments
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/payments` | Admin | View recent payments dashboard |
| `GET` | `/payments/ledger` | Admin | View payment accounting ledger |
| `GET` | `/payments/export` | Admin | Export payments ledger as CSV |
| `POST` | `/payments/manual` | Admin | Record manual administrative payment |
| `GET` | `/payments/:id` | Admin | View single payment detail |
| `PATCH` | `/payments/:id/verify` | Admin | Verify/Approve a pending payment proof |
| `PATCH` | `/payments/:id/manual-update` | Admin | Edit a payment transaction |
| `GET` | `/payments/:id/audit` | Admin | View audit logs for a payment |
| `POST` | `/payments/:id/proof` | Student | Upload payment screenshot proof |

---

### 📢 Notifications Center

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Admin | Retrieve logs of sent/scheduled broadcasts |
| `POST` | `/notifications` | Admin | Dispatch a new notification broadcast |

---

### 📊 Performance & Analytics (Admin)

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/performance` | Admin | Fetch students leaderboard, completion percentages, and checklists |

---

### 📊 Dashboard Analytics

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Admin | Global KPI figures & revenue stats |
| `GET` | `/dashboard/recent-enrollments` | Admin | Recent enrollment requests |
| `GET` | `/dashboard/upcoming-classes` | Admin | Upcoming scheduled live classes |

---

## Database Models

| Model | Key Fields | Description |
|---|---|---|
| `User` | id, name, email, password, role, avatar, is_active | Admin portal users with role-based access control (`super_admin`, `admin`, `support`). |
| `Student` | id (UUID), name, email, mobile_number, password, phone, avatar, is_active | Student profiles. Admin-created students use Name + Mobile Number as credentials. |
| `StudentAssignedCourse` | id, student_id, course_id, assigned_by, assigned_at | **Authorization gateway**: a student can only access courses that exist in this table. Created by admins; separate from the payment enrollment flow. |
| `Course` | id, title, description, price, thumbnail, category, level, status, instructor_name | Course catalog with status (`draft`, `published`, `archived`). |
| `CourseSection` | id, course_id, title, description, order, parent_id | Multi-tier sections supporting nested sub-sections. |
| `CourseModule` | id, title, order, type, duration, section_id, youtube_url, file_url, is_free | Individual lessons (video/document). Free lessons are accessible without full enrollment. |
| `Enrollment` | id, student_id, course_id, status, request_status, fee_status, payment_status, final_amount, paid_amount, **is_blocked**, **block_reason**, enrolled_at | Core enrollment record. Source of truth for payment state and course access suspension. Auto-created on first course access for admin-assigned students. |
| `Payment` | id, enrollment_id, student_id, amount, method, status, proof_url, transaction_ref, verified_by, verified_at, rejected_reason | Payment transaction records for fees and installments with proof file path. |
| `PaymentAuditLog` | id, payment_id, action, old_status, new_status, performed_by, notes | Immutable history log tracking all payment status transitions. |
| `Cart` | id, student_id | Shopping cart parent record per student. |
| `CartItem` | id, cart_id, course_id, price_at_add | Cart items linked to courses. |
| `LiveClass` | id, course_id, instructor_id, title, batch, scheduled_at, duration_mins, meeting_link, status | Upcoming virtual classrooms mapped to courses. |
| `Attendance` | id, live_class_id, student_id, is_present | Student presence log for live classes. |
| `Material` | id, course_id, title, file_url, file_type, file_size, download_count, is_free | Downloadable supplementary documents. |
| `Notification` | id, type, title, message, recipient_group, status, scheduled_at, sent_by | Global notification broadcasts sent/scheduled by admins. |
| `StudentProgress` | id, student_id, course_id, module_id, watch_duration, completed_at | Tracks completed lessons and watched duration per student and module. Unique index on (student_id, module_id) prevents duplicates. |

---

## Connecting Mobile to Local Server

### Physical Android Device (USB)

```bash
# Step 1: Connect device via USB (enable USB Debugging in developer options)
adb devices

# Step 2: Forward port so device can reach your local server
adb reverse tcp:5000 tcp:5000

# Step 3: Run the Flutter app
cd student_app
flutter run
```

> ⚠️ If you disconnect and reconnect the USB cable, re-run `adb reverse tcp:5000 tcp:5000`.

The app uses `http://127.0.0.1:5000/api` by default for physical devices with `adb reverse`.

### Android Emulator

Set `baseUrl` in `student_app/lib/core/constants/app_constants.dart` to:
```dart
static const String baseUrl = 'http://10.0.2.2:5000/api';
```

`10.0.2.2` is the emulator's alias for the host machine's `localhost`.

---

## License

This project is proprietary software developed for **MobileKI**. All rights reserved.
