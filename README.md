# Message API docs
## Overview
A RESTful API built with Node.js, Express, and MongoDB to manage and serve love messages. Supports user registration, login with JWT authentication, and full CRUD operations for messages.

---
## Tech Stack
### Backend Framework
- **Node.js** – JavaScript runtime

- **Express.js** – Web framework
### Database & ORM
- **MongoDB** – NoSQL database

- **Mongoose** – ODM for MongoDB
### Authentication & Security
- **bcrypt** – Password hashing

- **jsonwebtoken** – JWT authentication

- **cookie-parser** – Handle cookies for refresh tokens / sessions

- **sanitize-html** – Prevent HTML/JS injection in messages
### Email
- **nodemailer** – Sending verification and password reset emails
### Utilities
- **dotenv** – Environment variable management

- **cors** – Handle cross-origin requests

- **nodemon (dev)** – Auto-restart server on changes


## Features
### User Authentication & Authorization

- User registration with email verification

- Login with JWT authentication

- Refresh token support

- Password management:

    - Change password (authenticated)

    - Forgot password / reset password via token

- Logout and refresh token invalidation

- Role-based access control (guest, contributor, editor, admin, superadmin)

### Admin Controls

- List all users (admin only)

- Update user roles (admin only)

- Delete user accounts

### Message Management

- Create, read, update, delete messages

- Like/unlike messages

- Fetch random messages

- Fetch featured messages

- Fetch messages by category and status

- Pagination support for message lists

- Get all message categories

### Database & Models

- MongoDB with Mongoose schemas

- Seed messages from a JSON file (`messageDB.js`)

### Security

- Password hashing with bcrypt

- JWT-based route protection

- Admin and superadmin protected routes

- Token expiry configuration for JWT and password resets

### Email Features

- Email verification on signup

- Resend verification emails

- Password reset emails

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- A running instance of MongoDB (local or cloud)

### Installation
```
git clone https://github.com/sureshcstha/flirt-api.git
cd flirt-api
npm install
```
### Configuration
Create a .env file in the root:
```
MONGODB_URL=your_mongo_connection_string
JWT_EXPIRATION=1800            # 30 minutes in seconds (adjust as needed)
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://yourfrontend.com
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_google_app_password
APP_URL=your_api_base_url
SENDER_NAME="Your App Name"
USER_VERIFICATION_REDIRECT_URL=http://localhost:5173/login
RESET_PASSWORD_EXPIRY=1800000   # 30 minutes in milliseconds (adjust as needed)
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

### Run the Development Server
Start the server in development mode:
```
npm run dev
```

### Push Messages to Database
To seed the database with messages from a JSON file:
```
node messageDB.js
```

## Base URL

All endpoints are relative to:

```
https://luvnotes.onrender.com
```

## API Endpoints

### User Routes

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role Required** |
| --- | --- | --- | --- | --- |
| POST | `/users/signup` | Register a new user with email verification | No | None |
| POST | `/users/resend-verification` | Resend email verification link | No | None |
| GET | `/users/verify/:token` | Verify user email with token | No | None |
| POST | `/users/login` | User login and receive JWT | No | None |
| POST | `/users/refresh-token` | Get new JWT using refresh token | No | None |
| PUT | `/users/change-password` | Change password | Yes | User |
| POST | `/users/forgot-password` | Request password reset link | No | None |
| GET | `/users/reset-password/:token` | Verify password reset token | No | None |
| POST | `/users/reset-password` | Reset password with token and new password | No | None |
| POST | `/users/logout` | Logout user and invalidate refresh token | Yes | User |
| DELETE | `/users/delete` | Delete user account | Yes | User |
| GET | `/users/` | Get all users (admin only) | Yes | Admin |
| PUT | `/users/role/:id` | Update user role (admin only) | Yes | Admin |

### Key Notes:

- **Email Verification Flow:**
    
    Signup creates user + sends email verification.
    
    Users must verify with `/verify/:token`.
    
    Verification can be resent with `/resend-verification`.
    
- **Password Management:**
    
    Includes change password (authenticated users), forgot password (request reset email), and reset password via token.
    
- **Token Management:**
    
    Supports refresh tokens to keep user sessions alive securely.
    
- **Admin Controls:**
    
    Admins can list all users and update roles via protected routes.
    
- **Authentication:**
    
    Routes with `authenticateUser` middleware require a valid JWT.
    
    Admin routes additionally require `requireAdmin` middleware.
    

---

### Message Routes

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role Required** |
| --- | --- | --- | --- | --- |
| POST | `/messages/message` | Create new message | Yes | contributor, editor, admin, superadmin |
| GET | `/messages` | Get paginated list of messages | No | None |
| GET | `/messages?random=true` | Get a random message | No | None |
| GET | `/messages?featured=true` | Get all featured message | No | None |
| GET | `/messages?category=romantic&status=published&page=1&limit=30` | Get up to 30 published messages from the romantic category, starting from the first page | No | None |
| GET | `/messages/categories` | Get all message categories | No | None |
| GET | `/messages/message/:id` | Get a message by ID | No | None |
| PUT | `/messages/message/:id` | Update message by ID | Yes | editor, admin, superadmin |
| PATCH | `/messages/message/:id/like` | Like or unlike a message | Yes | None |
| DELETE | `/messages/message/:id` | Delete message by ID | Yes | superadmin |

### Pagination for `/messages`

- **Query parameters:**
    - `page` (optional, default: 1) — Current page number
    - `limit` (optional, default: 30) — Number of messages per page
- **Example:**

```bash
GET /messages?page=2&limit=10
```

### 🔎 Role Overview

| **Role** | **Description** |
| --- | --- |
| **guest** | Minimal access (view-only) |
| **contributor** *(default)* | Can create a new messages. Default role for new signups. |
| **editor** | Can manage others' messages — approve/edit them |
| **admin** | Can fully manage messages — approve/edit/delete them |
| **superadmin** | Full system access. Can perform all admin tasks, update roles, and sensitive actions. |

## Error Handling

- Returns standard HTTP status codes with JSON error messages.

## Author
Developed by Suresh Shrestha — feel free to reach out at sureshshr91@gmail.com