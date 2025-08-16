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
   # Copy the example file
   cp env.example .env

   # Edit .env with your actual values
   # (You'll need to create this manually since .env files are blocked)
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `8http://localhost:5000`

## 📁 Project Structure

```
server/
├── src/
│   └── index.js          # Main server file
├── package.json          # Dependencies and scripts
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload

## 🌐 API Endpoints

### Current Endpoints

- `GET /` - API status and welcome message
- `GET /health` - Health check endpoint

### Upcoming Endpoints

- User authentication (login, register, logout)
- Product management (CRUD operations)
- Order management
- User management

## 🔒 Environment Variables

Create a `.env` file in the server directory with:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

## 📊 Database Setup

We'll be using PostgreSQL. The database setup will be configured in the next steps.

## 🚧 Next Steps

1. Set up PostgreSQL database (Neon/Supabase)
2. Add database connection and models
3. Implement user authentication
4. Create product and order APIs
5. Add validation and error handling

## 🆘 Troubleshooting

- **Port already in use**: Change the PORT in your `.env` file
- **Module not found**: Run `npm install` to install dependencies
- **Environment variables not loading**: Make sure your `.env` file is in the server directory

## 📚 Dependencies

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **dotenv** - Environment variable loader
- **Nodemon** - Development auto-reload (dev dependency)
