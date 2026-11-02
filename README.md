# RateNest – Store Rating Management System

RateNest is a full-stack web application that allows users to rate stores and helps administrators and store owners manage store ratings through role-based dashboards.

## Features

### System Administrator
- View dashboard statistics, including total users, stores, and ratings.
- Create and manage users and stores.
- Create Store Owner accounts and assign them to stores.
- View and filter users, stores, and ratings.
- View detailed user and store information.

### Normal User
- Register and log in securely.
- Browse and search available stores.
- View store details and average ratings.
- Submit ratings from 1 to 5.
- Update previously submitted ratings.
- Change account password.

### Store Owner
- Log in to the assigned store owner account.
- View the assigned store's average rating.
- View total ratings and rating distribution.
- View users who have rated their store.
- Change account password.

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Node.js
- Express.js
- REST APIs
- JSON Web Tokens (JWT)
- bcrypt

### Database
- PostgreSQL

## Project Structure

```text
RateNest/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd RateNest
```

### 2. Set Up the Database

Create the database and load the schema (run from the project root):

```bash
psql -U postgres -c "CREATE DATABASE ratenest_db;"
psql -U postgres -d ratenest_db -f backend/database/schema.sql
```

The schema creates all tables, the three roles, and the `token_version` column used for session validation.

### 3. Configure Backend Environment Variables

```bash
cd backend
copy .env.example .env      # macOS/Linux: cp .env.example .env
```

Open `backend/.env` and set:

- `DB_PASSWORD` – your PostgreSQL password
- `JWT_SECRET` – a long random string
- `ADMIN_NAME` – 20 to 60 characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` – the first administrator's login (password: 8–16 characters, one uppercase letter, one special character)
- `ADMIN_ADDRESS` – any address up to 400 characters

Never commit the real `.env` file.

Create the first administrator account:

```bash
npm install
npm run create-admin
```

Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. From the admin dashboard you can create stores first, then Store Owner accounts and assign them to those stores.

Create a `.env` file inside the `backend` folder.

Configure your PostgreSQL connection, server port, frontend URL, and JWT secret using the environment variable names required by the backend.

Keep database credentials and secret keys private. Never commit the `.env` file.

### 4. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Application Validation Rules

- Name must contain between 20 and 60 characters.
- Address must not exceed 400 characters.
- Email must have a valid format.
- Password must contain 8–16 characters, at least one uppercase letter, and at least one special character.
- Store ratings must be between 1 and 5.
- Each user can submit one rating per store and update it later.

## Security

- Passwords are hashed using bcrypt.
- JWT-based authentication protects private routes.
- Role-based authorization restricts access to the appropriate dashboards and operations.
- Database queries use parameterized SQL to help prevent SQL injection.
- Password changes invalidate previously issued tokens.

## License

This project was developed for educational and software development purposes.