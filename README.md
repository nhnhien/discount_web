# Discount Web

Frontend application for the Discount Website project.

## Tech Stack

- React 18
- Vite
- Redux Toolkit
- React Query
- Ant Design
- Tailwind CSS
- i18next (Internationalization)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/nhnhien/discount_web.git
cd discount_web
```

### 2. Setup
```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_BASE_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- User authentication (Firebase)
- Product management
- Category management
- Order management
- Payment integration (VNPay)
- Discount management
- Multi-language support
- Responsive design
