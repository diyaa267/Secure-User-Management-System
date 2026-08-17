# Secure User Management System

A professional Flask + React user management application for an internship project.

## Features

- JWT-based authentication
- User registration and login
- Secure password hashing
- Profile view and profile update
- Change password
- Forgot/reset password flow
- Admin-only user management
- MySQL database support for deployment
- SQLite fallback for simple local development when MySQL variables are not configured
- Responsive professional UI
- Render deployment configuration

## Demo Credentials

**User**
- Email: `demo@secure.com`
- Password: `Demo@12345`

**Admin**
- Email: `admin@secure.local`
- Password: `Admin@12345`

The demo accounts are automatically created/reset when the API starts. Normal users must register before they can log in; arbitrary invalid credentials are not accepted.

## Backend Setup

```bash
cd secure-user-management-api
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
```

For MySQL, copy `.env.example` to `.env` and set:

```env
MYSQL_HOST=your-host
MYSQL_PORT=3306
MYSQL_USER=your-user
MYSQL_PASSWORD=your-password
MYSQL_DB=secure_user_management
SECRET_KEY=your-long-secret
JWT_SECRET_KEY=your-long-jwt-secret
```

Run locally:

```bash
python app.py
```

The API runs on `http://127.0.0.1:5000` by default.

## Frontend Setup

```bash
cd secure-user-management-frontend
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://127.0.0.1:5000
```

Run:

```bash
npm run dev
```

## Render Deployment

Deploy the API and frontend as separate Render services.

### API environment variables

Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`, `SECRET_KEY`, and `JWT_SECRET_KEY` in the Render API service.

Start command:

```bash
gunicorn app:app
```

### Frontend environment variable

Set:

```env
VITE_API_URL=https://YOUR-API-SERVICE.onrender.com
```

Then build with:

```bash
npm ci && npm run build
```

The repository includes a root `render.yaml` that defines both services.
