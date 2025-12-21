// Helper to strip trailing slash
const stripSlash = (url) => url && url.endsWith('/') ? url.slice(0, -1) : url;

const frontendUrl = process.env.FRONTEND_URL;
const frontendUrlAlt = process.env.FRONTEND_URL_ALT;

export const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
  allowedOrigins.push(stripSlash(frontendUrl));
}

if (frontendUrlAlt) {
  allowedOrigins.push(frontendUrlAlt);
  allowedOrigins.push(stripSlash(frontendUrlAlt));
}

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page"],
  maxAge: 86400 // 24 hours
};

export default corsOptions;

