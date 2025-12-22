# Live Website: https://ecommerce-mern-website-1.com

# Frontend-Backend Connection Setup Guide

This guide explains how the frontend and backend are connected and how to run them together.

## Architecture

### Development Mode
- **Frontend**: Runs on `http://localhost:3000` (Vite dev server)
- **Backend**: Runs on `http://localhost:5000` (Express server)
- **Connection**: Vite proxy forwards `/api/*` requests to backend

### Production Mode
- **Backend**: Serves both API and frontend static files
- **Frontend**: Built and served from `backend` directory
- **Single Port**: Everything runs on one port (default: 5000)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
DB_NAME=repairEcommerce
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Running in Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will automatically proxy API requests to the backend.

### 4. Running in Production

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Start Backend (serves frontend too):**
```bash
cd backend
NODE_ENV=production npm start
```

The backend will serve:
- API at: `http://localhost:5000/api/v1/*`
- Frontend at: `http://localhost:5000/*`

## API Configuration

### API Base URL

The frontend uses a centralized API configuration in `frontend/src/config/api.js`:

- **Development**: Uses relative paths (`/api/v1`) which are proxied by Vite
- **Production**: Uses relative paths, works with same-origin serving

### API Endpoints

All API endpoints are defined in `API_ENDPOINTS` object:

```javascript
import { api, API_ENDPOINTS } from '../config/api.js';

// Example usage
const data = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
```

### Socket.IO Connection

Socket.IO is configured to connect to the backend:

```javascript
import { SOCKET_URL } from '../config/api.js';
const socket = io(SOCKET_URL);
```

## Vite Proxy Configuration

The `vite.config.js` includes proxy settings:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
  '/socket.io': {
    target: 'http://localhost:5000',
    ws: true, // WebSocket support
  },
  '/uploads': {
    target: 'http://localhost:5000',
  }
}
```

This means:
- Frontend calls `/api/v1/auth/login`
- Vite proxies to `http://localhost:5000/api/v1/auth/login`
- No CORS issues in development

## CORS Configuration

The backend CORS is configured in `backend/src/config/cors.js`:

- Allows `http://localhost:3000` (frontend dev server)
- Allows `http://localhost:5173` (alternative Vite port)
- Allows production URL from environment variable

## File Structure

```
ecommerce-mern-website/
├── backend/
│   ├── src/
│   │   ├── app.js          # Express app (serves frontend in production)
│   │   ├── server.js       # Server entry point
│   │   └── ...
│   └── uploads/            # File uploads directory
└── frontend/
    ├── src/
    │   ├── config/
    │   │   └── api.js      # API configuration
    │   └── ...
    └── dist/               # Built files (for production)
```

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check `cors.js` configuration

### API Not Found (404)
- Verify API routes use `/api/v1/` prefix
- Check backend is running on port 5000
- Check Vite proxy configuration

### Socket.IO Not Connecting
- Verify `SOCKET_URL` in frontend config
- Check backend Socket.IO initialization
- Ensure WebSocket proxy is enabled in Vite

### Production Build Issues
- Make sure frontend is built before starting backend
- Check `frontend/dist` directory exists
- Verify `NODE_ENV=production` is set

## Environment Variables

### Backend (.env)
- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL`: API base URL (default: `/api/v1`)
- `VITE_SOCKET_URL`: Socket.IO server URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Testing the Connection

1. **Health Check**: `http://localhost:5000/health`
2. **API Root**: `http://localhost:5000/api/v1`
3. **Frontend**: `http://localhost:3000` (dev) or `http://localhost:5000` (prod)

## Next Steps

1. Update all frontend components to use the new API utility
2. Add error handling and loading states
3. Implement authentication state management
4. Add API interceptors for token refresh

