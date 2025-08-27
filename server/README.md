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
│   │   ├── auth.js           # Authentication routes
│   │   ├── products.js       # Product management routes
│   │   └── users.js          # User management routes
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

### User Management Endpoints

#### 4. Get User by ID (Admin Only)

- **URL:** `GET /api/users/:id`
- **Description:** Retrieve a specific user by ID (admin access required)
- **Headers:** `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Parameters:** `:id` - User ID (number)
- **Response (200):**
  ```json
  {
    "message": "User retrieved successfully",
    "user": {
      "id": 1,
      "email": "admin@joantee.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - **400 Bad Request:** Invalid user ID format
  - **401 Unauthorized:** No or invalid JWT token
  - **403 Forbidden:** User is not an admin
  - **404 Not Found:** User with specified ID doesn't exist

### Product Endpoints

#### 5. Get All Products

- **URL:** `GET /api/products`
- **Description:** Retrieve all active products (public route - no authentication required)
- **Headers:** None required
- **Response (200):**
  ```json
  {
    "message": "Products retrieved successfully",
    "count": 3,
    "products": [
      {
        "id": 1,
        "name": "Classic White T-Shirt",
        "description": "Premium cotton classic fit t-shirt",
        "price": "29.99",
        "category": "T-Shirts",
        "size": "M",
        "color": "White",
        "stock_quantity": 50,
        "image_url": null,
        "created_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Denim Jeans",
        "description": "Comfortable straight-leg denim jeans",
        "price": "79.99",
        "category": "Jeans",
        "size": "32",
        "color": "Blue",
        "stock_quantity": 30,
        "image_url": null,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### 6. Get Single Product by ID

- **URL:** `GET /api/products/:id`
- **Description:** Retrieve a specific product by ID (public route - no authentication required)
- **Headers:** None required
- **Parameters:** `:id` - Product ID (number)
- **Response (200):**
  ```json
  {
    "message": "Product retrieved successfully",
    "product": {
      "id": 1,
      "name": "Classic White T-Shirt",
      "description": "Premium cotton classic fit t-shirt",
      "price": "29.99",
      "category": "T-Shirts",
      "size": "M",
      "color": "White",
      "stock_quantity": 50,
      "image_url": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - **400 Bad Request:** Invalid product ID format (not a number)
  - **404 Not Found:** Product with specified ID doesn't exist or is inactive

### Utility Endpoints

#### 7. API Status

- **URL:** `GET /`
- **Description:** Check if API is running
- **Response (200):**
  ```json
  {
    "message": "Joantee Backend API is running!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

#### 8. Health Check

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

#### 9. Database Test

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

### Admin Access

Some endpoints require admin role (`role: "admin"`):

- `GET /api/users/:id` - Get user details
- Future endpoints: Create/Update/Delete products, Manage users

**Sample Admin User:**

- Email: `admin@joantee.com`
- Password: `admin123`

## 📊 Database Schema

### Users Table Structure

The users table contains the following fields:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table Structure

The products table contains the following fields:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category VARCHAR(100) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Data

The database comes pre-loaded with:

**Sample Users:**

- **Admin User:** admin@joantee.com (role: admin)

**Sample Products:**

- **Classic White T-Shirt** - $29.99 (T-Shirts category)
- **Denim Jeans** - $79.99 (Jeans category)
- **Hooded Sweatshirt** - $59.99 (Hoodies category)

### Data Types for Frontend

**User Fields:**

- **id**: Integer (unique identifier)
- **email**: String (user email)
- **first_name**: String (user's first name)
- **last_name**: String (user's last name)
- **role**: String ("admin" or "customer")
- **is_active**: Boolean (account status)
- **created_at**: ISO Date String (when account was created)
- **updated_at**: ISO Date String (when account was last updated)

**Product Fields:**

- **id**: Integer (unique identifier)
- **name**: String (product name)
- **description**: String (product description)
- **price**: Decimal (price in dollars, e.g., "29.99")
- **category**: String (product category)
- **size**: String (product size, can be null)
- **color**: String (product color, can be null)
- **stock_quantity**: Integer (available stock)
- **image_url**: String (product image URL, can be null)
- **created_at**: ISO Date String (when product was created)

## 🚧 Next Steps

1. ✅ Set up PostgreSQL database (Neon)
2. ✅ Create database connection and models
3. ✅ Implement user authentication
4. ✅ Create basic product listing API
5. ✅ Create basic user management API
6. 🔄 Add product management (Create, Update, Delete)
7. 🔄 Add user listing and management
8. 🔄 Implement order system
9. 🔄 Add validation and error handling

## 🆘 Troubleshooting

- **Port already in use**: Change the PORT in your `.env` file
- **Module not found**: Run `npm install` to install dependencies
- **Environment variables not loading**: Make sure your `.env` file is in the server directory
- **Database connection failed**: Check your DATABASE_URL in the `.env` file
- **JWT errors**: Make sure JWT_SECRET is set in your `.env` file
- **Admin access denied**: Make sure you're using an admin user's JWT token

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
