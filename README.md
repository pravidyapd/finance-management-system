# FinTrack – Finance Management System

A full-stack web application for managing personal and business finances. FinTrack helps users track income, expenses, clients, payments, and financial reports through a simple dashboard.

## Features

- User Registration and Login
- Dashboard with financial summaries
- Income Management (Add, View, Edit, Delete)
- Expense Management (Add, View, Edit, Delete)
- Client Management
- Payment Tracking
- Financial Reports and Charts
- PostgreSQL Database Integration
- Responsive User Interface

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React

**Backend**
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- Maven
- REST APIs

**Database**
- PostgreSQL

## Project Structure

```text
finance-management-system/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .gitignore
│
├── backend/
│   └── fintrack/
│       ├── src/
│       ├── pom.xml
│       └── .gitignore
│
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- Java JDK
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd finance-management-system
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Database

Create a PostgreSQL database named:

```sql
CREATE DATABASE fintrack_db;
```

### 4. Setup Backend

Configure your PostgreSQL username and password in:

`backend/fintrack/src/main/resources/application.properties`

Use `application-example.properties` as a reference.

Run the backend:

```bash
cd backend/fintrack
mvnw.cmd spring-boot:run
```