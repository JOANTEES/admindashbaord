# Joantee Backend API

This is the backend API server for the Joantee admin dashboard and user web application.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   # Create .env file manually with your Neon database connection
   # DATABASE_URL=postgresql://username:password@hostname.neon.tech/database_name?sslmode=require&channel_binding=require
   # JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   ```

4. **Initialize the database:**

   ```bash
   npm run db:init
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
server/
├── src/
│   ├── index.js              # Main server file
│   ├── routes/
│   │   └── auth.js           # Authentication routes
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   └── database/
│       └── init.js           # Database initialization script
├── database/
│   └── schema.sql            # Database table definitions
├── package.json              # Dependencies and scripts
├── .gitignore               # Git ignore rules
├── .eslintrc.js             # ESLint configuration
└── README.md                # This file
```

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run db:init` - Initialize database tables and sample data
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Fix linting issues automatically

## 🌐 API Endpoints

### Base URL

```
http://localhost:5000
```

### Authentication Endpoints

#### 1. User Registration

- **URL:** `POST /api/auth/register`
- **Description:** Register a new user account
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. User Login

- **URL:** `POST /api/auth/login`
- **Description:** Authenticate user and get JWT token
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Get User Profile

- **URL:** `GET /api/auth/profile`
- **Description:** Get current user's profile information
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):**
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Utility Endpoints

#### 4. API Status

- **URL:** `GET /`
- **Description:** Check if API is running
- **Response (200):**
  ```json
  {
    "message": "Joantee Backend API is running!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

#### 5. Health Check

- **URL:** `GET /health`
- **Description:** Check API health status
- **Response (200):**
  ```json
  {
    "status": "OK",
    "uptime": 123.456,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

#### 6. Database Test

- **URL:** `GET /db-test`
- **Description:** Test database connection
- **Response (200):**
  ```json
  {
    "message": "Database connection successful!",
    "data": {
      "current_time": "2024-01-01T00:00:00.000Z",
      "db_version": "PostgreSQL 15.0..."
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

## 🔒 Authentication

### JWT Token Usage

- **Token Format:** `Bearer <JWT_TOKEN>`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Expiration:** 24 hours
- **Token Payload:**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "role": "customer"
  }
  ```

### Protected Routes

Routes that require authentication will return:

- **401 Unauthorized** if no token is provided
- **401 Unauthorized** if token is invalid
- **403 Forbidden** if user doesn't have required role (for admin routes)

## 📊 Database Schema

The database includes these tables:

- **users** - User accounts and authentication
- **products** - Clothing items with inventory
- **orders** - Customer orders
- **order_items** - Individual items in orders

Sample data is automatically added during initialization.

## 🚧 Next Steps

1. ✅ Set up PostgreSQL database (Neon)
2. ✅ Create database connection and models
3. ✅ Implement user authentication
4. 🔄 Create product and order APIs
5. 🔄 Add validation and error handling

## 🆘 Troubleshooting

- **Port already in use**: Change the PORT in your `.env` file
- **Module not found**: Run `npm install` to install dependencies
- **Environment variables not loading**: Make sure your `.env` file is in the server directory
- **Database connection failed**: Check your DATABASE_URL in the `.env` file
- **JWT errors**: Make sure JWT_SECRET is set in your `.env` file

## 📚 Dependencies

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **dotenv** - Environment variable loader
- **pg** - PostgreSQL driver
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token handling
- **express-validator** - Input validation
- **Nodemon** - Development auto-reload (dev dependency)
- **ESLint** - Code linting (dev dependency)
