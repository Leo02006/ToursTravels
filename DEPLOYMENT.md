# Deployment Guide: Tours & Travels Project

This guide outlines the steps required to host the **Tours & Travels** application in a production environment using **Render**, **Vercel**, and **MongoDB Atlas**.

---

## 1. Database Setup (MongoDB Atlas)

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write permissions.
3. Whitelist IP addresses (or allow access from anywhere `0.0.0.0/0` for cloud hosting).
4. Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/tours_travels?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render / Railway / Heroku)

Deploy the contents of the `backend/` directory.

### Environment Variables
Configure these in your hosting provider's dashboard:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A long, random string (e.g., `shgdf823yhd823yh9823h`).
- `FRONTEND_URL`: Your production frontend URL (e.g., `https://tours-travels.vercel.app`).
- `PORT`: `5000` (Render will usually provide this automatically).
- `NODE_ENV`: `production`

### Build Settings
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

---

## 3. Frontend Deployment (Vercel)

Deploy the contents of the `frontend/` directory.

### Environment Variables
Configure these in the Vercel project settings:
- `NEXT_PUBLIC_API_URL`: Your production backend URL (e.g., `https://tours-backend.onrender.com/api`).
- `NODE_ENV`: `production`

### Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

---

## 4. Post-Deployment Verification

1. **Verify API Connectivity**: Try to register a new user on the live site.
2. **Responsive Check**: Ensure the Hamburger menu and dashbaord grids work on mobile.
3. **Email/Auth**: Verify that cookies are being sent/received correctly. Note: For cross-domain cookies to work, you may need to ensure the backend uses `sameSite: 'none'` and `secure: true` in production (this is already handled by CORS/Cookie logic in `authController.js`).

> [!IMPORTANT]
> Ensure the `FRONTEND_URL` in the backend matches the Vercel domain exactly (including `https://`) to prevent CORS issues.
