# 🍕 7 Bites Café & Pizzeria — Operating System & Web Platform

A high-performance modern web application, POS system, and operations suite for **7 Bites Café & Pizzeria** (Chhatarpur, Madhya Pradesh).

Built with **TanStack Start (SSR)**, **React 19**, **Tailwind CSS v4**, and **Recharts**.

---

## 🌟 Key Features

### 1. 🍽️ Customer Experience Portal
- **Interactive Menu & Category Navigation**: Pizzas, Burgers, Pasta, Beverages, Combos, and Desserts.
- **Table Event Reservation Desk**: Real-time table booking for Birthdays, Corporate Lunches, and Celebrations.
- **Special Offers & Live Promotions**: Happy hour discounts and family combo packages.
- **Customer Reviews & Testimonials**: Verified guest reviews and ratings.
- **Location & Contact Hub**: Direct phone, WhatsApp orders, and Google Maps integration for Chhatarpur.

### 2. ⚡ 7 Bites POS & Operations Desk (`/admin`)
- **3×3 Active Ticket Grid**: Manage concurrent orders with multi-person split ticketing per table (e.g. Table 4 Person 1 & Person 2).
- **Fast Item Dispatch**: Add items, adjust quantities, and calculate 5% GST in real-time.
- **GST Thermal Tax Invoice (80mm)**: Single-click instant generation of printable customer receipts with subtotal, GST breakdown, customer name, and contact.
- **Order History & Search**: Full audit trail of completed tickets with filtering by date, table, and order number.
- **Table Floor Map (Full-Table Events)**: Floor plan dedicated to complete table event bookings with instant guest pass view.
- **Business Intelligence & Analytics**:
  - Live Operations Overview with revenue counters and active order meters.
  - Interactive Hourly Sales Curve (Recharts AreaChart with animated gradients).
  - Category Revenue Share Donut Chart.
  - Hourly Order Density Heatmap BarChart.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation
```bash
# Clone the repository
git clone https://github.com/mahendra0011/seven-bites-cafe-os.git

# Enter project directory
cd seven-bites-cafe-os

# Install dependencies
npm install
```

### Development
```bash
# Start local development server
npm run dev
```
Open `http://localhost:8080` (or the port displayed in terminal) to view the application.

### Production Build & Launch
```bash
# Compile and build for production
npm run build

# Start the production SSR server
npm start
```

---

## 🛠️ Tech Stack

- **Framework**: TanStack Start (SSR + React 19)
- **Styling**: Tailwind CSS v4 + Radix UI Primitives + Lucide Icons
- **Data Visualization**: Recharts (Custom Gradient AreaCharts, Donut Charts, Bar Charts)
- **State Management**: TanStack React Query + Local Persistent State
- **Testing**: Vitest + React Testing Library

---

## ☁️ Deployment

This project includes production-ready deployment configurations:
- **Render Blueprint**: Configured via `render.yaml` as an auto-deploying Web Service.
- **Docker**: Production multi-stage `Dockerfile` and `.dockerignore` included.

---

## 📄 License

Proprietary © 7 Bites Café & Pizzeria, Chhatarpur, Madhya Pradesh. All rights reserved.
