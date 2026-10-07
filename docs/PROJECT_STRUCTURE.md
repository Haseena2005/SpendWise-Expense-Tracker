# SpendWise - Architecture & Setup Documentation

## Overview
SpendWise is a personal expense tracking and financial analytics web application.

## Directory Structure
```
SpendWise/
├── client/                 # React + Vite Frontend Application
│   ├── public/             # Static public assets
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application page views
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context state management
│   │   ├── services/       # API integration services (axios)
│   │   └── utils/          # Helpers & formatting utilities
│   ├── .env.example        # Frontend environment template
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite configuration & API proxying
├── server/                 # Express + Node.js Backend API
│   ├── src/
│   │   ├── config/         # Database and app configurations
│   │   ├── controllers/    # API Request Handlers
│   │   ├── middleware/     # Error handling & validation middleware
│   │   ├── models/         # Mongoose Schemas (Category, Transaction)
│   │   ├── routes/         # Express Route declarations
│   │   ├── services/       # Business logic layer
│   │   └── utils/          # Utility modules
│   ├── .env.example        # Backend environment template
│   └── package.json        # Backend dependencies & scripts
└── docs/                   # Documentation and architectural guides
```

## Running the Application

### Server Setup & Startup
```bash
cd server
npm install
npm run dev
```

### Client Setup & Startup
```bash
cd client
npm install
npm run dev
```
