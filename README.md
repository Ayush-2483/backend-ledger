# Backend Ledger

Backend Ledger is a secure account and transaction management system built with Node.js, Express, MongoDB, JWT authentication, MongoDB transactions, token blacklisting, TTL cleanup, and email notifications.

The project supports user registration, login, logout, account creation, balance tracking, initial funds, money transfers, transaction history, idempotency protection, and transaction email notifications.

## Overview

Backend Ledger maintains a double-entry style ledger system.

Every transaction creates:

- One debit ledger entry from the source account
- One credit ledger entry to the destination account
- One transaction record with status tracking
- A unique idempotency key to prevent duplicate deductions

The system supports two types of users:

- Normal users
- System users

System users can add initial funds to another user's account. Normal users can transfer money only from their own accounts.

## Features

### Authentication

- User registration
- User login with JWT
- Password hashing using bcryptjs
- Cookie-based authentication
- Bearer token authentication
- Protected routes
- System-user authorization
- Logout API
- Token blacklist after logout
- Automatic blacklist cleanup with MongoDB TTL

### Account Management

- Create a new account
- Get all accounts of the logged-in user
- Get account balance
- Account status management
- Active, frozen, and closed account states
- INR currency support

### Transactions

- Normal account-to-account transfers
- System-user initial funds
- Debit and credit ledger entries
- MongoDB session-based transactions
- Transaction status tracking
- Completed, pending, failed, and reversed states
- Duplicate transaction prevention with idempotency keys
- Protection against concurrent duplicate requests
- Sender account ownership validation
- Active account validation
- Positive amount validation

### Email Notifications

- Registration email
- Successful transaction email to the sender
- Successful transaction email to the receiver
- Initial funds email to the destination account owner
- Failed transaction email service support
- Gmail OAuth2 email integration using Nodemailer

### Frontend Dashboard

- Login and registration interface
- Overview dashboard
- Account list
- Account balances
- Transaction history
- Send funds screen
- System-user initial funds screen
- Admin-only initial funds option
- Automatic dashboard balance refresh
- Logout support
- Responsive layout for desktop and mobile

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- Nodemailer
- cookie-parser
- dotenv

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- Fetch API
- Responsive CSS layout

### Services

- MongoDB Atlas
- Gmail OAuth2
- Nodemon for development

## Folder Structure

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
