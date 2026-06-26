#  Expenzo

A full-stack expense management web application built with Node.js, Express, MongoDB, and React.

##  Live Demo
**Frontend:** https://expense-tracker-omega-beryl-57.vercel.app  
**Demo credentials:** email: `demo@gmail.com` / password: `123456`

##  Features
- JWT Authentication (register, login, protected routes)
- Add, edit, delete expenses with categories
- Set monthly budgets per category
- Automatic alerts when budget is 80% or 100% exceeded
- Analytics dashboard with pie chart and line chart
- Filter expenses by category, date range, amount
- Export expenses to CSV
- Notification system with unread count
- Fully responsive UI

##  Tech Stack
**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt  
**Frontend:** React, Vite, Tailwind CSS, Axios, Recharts  
**Deployment:** Render (backend), Vercel (frontend)

##  Run Locally

### Backend
```bash
cd backend
npm install
# Create .env file with MONGO_URI, JWT_SECRET, JWT_EXPIRE, NODE_ENV
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

##  Project Structure
```
expense-tracker-pro/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth + error handling
│   │   ├── models/       # Mongoose schemas
│   │   └── routes/       # API endpoints
│   └── app.js
└── frontend/
    └── src/
        ├── components/   # Reusable UI components
        ├── context/      # Global auth state
        ├── pages/        # Dashboard, Expenses, Budgets, Profile
        └── utils/        # Axios instance
```