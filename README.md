# BNPL Hackathon Backend

<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive **Buy Now Pay Later (BNPL)** backend service built with NestJS, designed for hackathon development. This application provides a complete financial ecosystem for credit assessment, user management, and payment processing.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based secure authentication system
- **Credit Decision Engine** - ML-powered credit scoring and decision making
- **Financial Profile Management** - Complete user financial data handling
- **Credit Request Processing** - End-to-end credit application workflow
- **Notification System** - Email notifications for important events
- **API Documentation** - Swagger/OpenAPI documentation
- **Database Integration** - PostgreSQL with TypeORM
- **Secure Password Handling** - bcrypt encryption

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Email**: @nestjs-modules/mailer
- **Security**: bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd bnpl-hackathon-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the environment template and configure your variables:
```bash
cp .env.example .env
```

Update `.env` with your database and JWT credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/bnpl_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 4. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE bnpl_db;
```

### 5. Run the application
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **API Docs**: `http://localhost:3000/api-json`

## 🔧 Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication & JWT handling
│   ├── user/           # User management
│   ├── credit-decision/    # Credit scoring & decisions
│   ├── credit-request/     # Credit application processing
│   ├── financial-profile/  # User financial data
│   ├── ml-scoring/         # Machine learning integration
│   └── notification/       # Email notifications
├── entities/           # Database entities
├── common/             # Shared utilities & decorators
├── app.module.ts       # Root application module
├── app.controller.ts   # Root controller
└── main.ts            # Application entry point
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Credit Requests
- `POST /credit-requests` - Submit credit application
- `GET /credit-requests` - List user credit requests
- `GET /credit-requests/:id` - Get specific credit request

### Financial Profile
- `POST /financial-profile` - Create financial profile
- `GET /financial-profile` - Get financial profile
- `PUT /financial-profile` - Update financial profile

## 🚀 Deployment

### Environment Variables
Ensure these environment variables are set in production:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure JWT secret key
- `JWT_EXPIRES_IN` - Token expiration time

### Docker Deployment
```bash
# Build the Docker image
docker build -t bnpl-backend .

# Run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and unlicensed.

## 🆘 Support

For questions and support, please reach out to the development team or create an issue in the repository.
