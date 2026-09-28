# 💰 Backend Ledger

> A secure account and transaction management system built with **Node.js, Express.js, MongoDB, JWT authentication, and MongoDB transactions**.

<p align="center">

[🚀 **Live Demo**](https://backend-ledger-j8p4.onrender.com/)

</p>

---

## 🚀 Live Demo

### 👉 [TRY BACKEND LEDGER LIVE](https://backend-ledger-j8p4.onrender.com/)

**Demo credentials**

```text
Email: YOUR_DEMO_EMAIL
Password: YOUR_DEMO_PASSWORD
```

> ⚠️ The live demo uses a separate database/environment. Please do not use real financial information.

---

## 📌 Overview

**Backend Ledger** is a secure account and transaction management system designed around a **double-entry style ledger architecture**.

The system supports:

* User registration and authentication
* Account creation and balance management
* Money transfers between accounts
* System-user initial funds
* Transaction history
* MongoDB atomic transactions
* Idempotency protection
* Token blacklisting
* MongoDB TTL cleanup
* Email notifications
* Responsive frontend dashboard

### 🔄 Transaction Flow

```text
                    User
                     │
                     ▼
              Authentication
                     │
                     ▼
               API Request
                     │
                     ▼
              Auth Middleware
                     │
                     ▼
          Transaction Controller
                     │
                     ▼
          MongoDB Session/Transaction
                ┌────┴────┐
                ▼         ▼
          Debit Entry  Credit Entry
                │         │
                └────┬────┘
                     ▼
             Transaction Record
                     │
                     ▼
              Email Notification
```

---

# ✨ Features

## 🔐 Authentication

* User registration
* User login with JWT
* Password hashing using `bcryptjs`
* Cookie-based authentication
* Bearer token authentication
* Protected routes
* System-user authorization
* Logout API
* JWT token blacklisting
* Automatic blacklist cleanup using MongoDB TTL

---

## 🏦 Account Management

* Create a new account
* Get all accounts belonging to the logged-in user
* Get account balance
* Account status management
* Active / Frozen / Closed states
* INR currency support
* Account ownership validation

---

## 💸 Transactions

### Normal Transfers

Users can transfer money between their own and other eligible accounts.

Each transfer creates:

```text
Sender Account
      │
      │ DEBIT
      ▼
Ledger Entry
      │
      │
      ▼
Transaction Record
      │
      │
      ▼
Ledger Entry
      │ CREDIT
      ▼
Receiver Account
```

### Transaction Safety

The system includes:

* MongoDB session-based transactions
* Atomic balance updates
* Debit and credit ledger entries
* Transaction status tracking
* Idempotency keys
* Duplicate transaction prevention
* Concurrent request protection
* Sender ownership validation
* Destination account validation
* Active account validation
* Positive amount validation

### Transaction States

```text
PENDING
   │
   ├──► COMPLETED
   │
   ├──► FAILED
   │
   └──► REVERSED
```

---

## 💰 System-User Initial Funds

System users can add initial funds to another user's account.

```text
System User
     │
     │ Initial Funds
     ▼
Destination Account
     │
     ├── Balance Updated
     ├── Ledger Entry Created
     └── Email Notification
```

Normal users cannot access this functionality.

---

# 📧 Email Notifications

The system integrates **Nodemailer + Gmail OAuth2** for transactional emails.

Supported notifications include:

* Registration email
* Successful transaction email to sender
* Successful transaction email to receiver
* Initial funds email
* Failed transaction email support

```text
Transaction
     │
     ▼
Transaction Successful
     │
     ▼
Email Service
     │
     ├──► Sender
     │
     └──► Receiver
```

---

# 🖥️ Frontend Dashboard

The project also includes a responsive frontend dashboard.

### Dashboard Features

* Login
* Registration
* Account overview
* Account list
* Account balances
* Transaction history
* Send funds
* System-user initial funds
* Admin-only functionality
* Automatic balance refresh
* Logout
* Responsive desktop/mobile UI

---

# 🛠️ Tech Stack

## Backend

| Technology    | Purpose                   |
| ------------- | ------------------------- |
| Node.js       | JavaScript runtime        |
| Express.js    | REST API framework        |
| MongoDB       | Database                  |
| Mongoose      | MongoDB ODM               |
| JWT           | Authentication            |
| bcryptjs      | Password hashing          |
| Nodemailer    | Email notifications       |
| cookie-parser | Cookie handling           |
| dotenv        | Environment configuration |

## Frontend

| Technology | Purpose           |
| ---------- | ----------------- |
| HTML       | Structure         |
| CSS        | Styling           |
| JavaScript | Application logic |
| Fetch API  | API communication |

## Services

* MongoDB Atlas
* Gmail OAuth2
* Nodemon

---

# 🏗️ Architecture

```text
Frontend
   │
   │ HTTP / Fetch API
   ▼
Express.js API
   │
   ├── Routes
   │
   ├── Middleware
   │      └── Authentication / Authorization
   │
   ├── Controllers
   │
   ├── Services
   │      └── Email Service
   │
   └── Models
          │
          ▼
      MongoDB
```

---

# 🔒 Security

Security was considered throughout the application.

### Authentication

```text
Password
   │
   ▼
bcryptjs
   │
   ▼
Hashed Password
   │
   ▼
MongoDB
```

### JWT Authentication

```text
Login
  │
  ▼
JWT Generated
  │
  ▼
Cookie / Authorization Header
  │
  ▼
Auth Middleware
  │
  ▼
Protected Route
```

### Logout

```text
Logout
  │
  ▼
JWT Added To Blacklist
  │
  ▼
MongoDB TTL
  │
  ▼
Automatic Cleanup
```

---

# 🧠 Important Backend Concepts Implemented

This project demonstrates practical backend concepts including:

* REST API design
* Authentication & authorization
* JWT
* Password hashing
* HTTP cookies
* Middleware
* MongoDB transactions
* Mongoose sessions
* Atomic database operations
* Double-entry style ledger design
* Idempotency
* Concurrent request protection
* Database indexing
* MongoDB TTL indexes
* Transaction state management
* Email service integration
* Environment variables
* Error handling
* Role-based authorization

---

# 📂 Folder Structure

```text
BACKEND-LEDGER/
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   │
│   └── src/
│       ├── app.js
│       │
│       ├── config/
│       │   └── db.js
│       │
│       ├── controllers/
│       │   ├── account.controller.js
│       │   ├── auth.controller.js
│       │   └── transaction.controller.js
│       │
│       ├── middleware/
│       │   └── auth.middleware.js
│       │
│       ├── models/
│       │   ├── account.model.js
│       │   ├── blacklist.model.js
│       │   ├── ledger.model.js
│       │   ├── transaction.model.js
│       │   └── user.model.js
│       │
│       ├── routes/
│       │   ├── account.routes.js
│       │   ├── auth.routes.js
│       │   └── transaction.routes.js
│       │
│       └── services/
│           └── email.service.js
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
└── .gitignore
```

---

# ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPO_URL
cd BACKEND-LEDGER
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### 4. Start the backend

```bash
npm run dev
```

### 5. Open the frontend

Open:

```text
frontend/index.html
```

---

# 🧪 API Testing

API endpoints can be tested using:

* Postman
* Thunder Client
* Browser
* Frontend dashboard

Example:

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

POST /api/accounts
GET  /api/accounts
GET  /api/accounts/:id

POST /api/transactions
GET  /api/transactions
```

---

# 🎯 What This Project Demonstrates

> **Backend Ledger was built to demonstrate production-oriented backend concepts rather than just basic CRUD operations.**

The project focuses on:

**Security → Consistency → Atomicity → Idempotency → Authorization → Reliability**

---

## 👨‍💻 Author

**Ayush Chaurasiya**

Backend / MERN Stack Developer

[GitHub](https://github.com/Ayush-2483) • [LinkedIn](https://www.linkedin.com/in/ayush2483)
