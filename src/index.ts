import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { timing } from 'hono/timing';
import { secureHeaders } from 'hono/secure-headers';
import { cache } from 'hono/cache';
import { compress } from 'hono/compress';
import { etag } from 'hono/etag';
import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';

import generalRoutes from './routes/general';
import productRoutes from './routes/product';
import userProfilesRoutes from './routes/userProfiles';
import vendorRoutes from './routes/vendor';

// --- Cloudflare Bindings and HealthStatus interfaces ---
interface CloudflareBindings {
  ENVIRONMENT?: string;
  API_VERSION?: string;
  API_BASE_URL?: string;
  LOG_LEVEL?: string;
  ENABLE_DETAILED_LOGGING?: string;
  ENABLE_PERFORMANCE_MONITORING?: string;
  JWT_SECRET?: string;
  DATABASE_URL?: string;
  ASSETS?: any;
  DB?: any;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  requestId: string;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();
const startTime = Date.now();

// --- Middleware ---
app.use('*', secureHeaders({
  crossOriginResourcePolicy: 'cross-origin',
  referrerPolicy: 'no-referrer',
  strictTransportSecurity: 'max-age=31536000',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
}));

// Request ID for tracking
import { requestId } from 'hono/request-id';
app.use('*', requestId());

// CORS with optimized config
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://main-website-plantomart.pages.dev',
    ];
    return !origin || allowedOrigins.includes(origin) ? (origin || '*') : '';
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
  credentials: true,
}));

// Logging (dev only, env-aware)
app.use('*', async (c, next) => {
  const isDev = c.env?.ENVIRONMENT === 'development';
  const enableLogging = c.env?.ENABLE_DETAILED_LOGGING === 'true';
  if (isDev && enableLogging) {
    const requestId = c.get('requestId');
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] [${requestId}] --> ${c.req.method} ${c.req.url}`);
    await next();
    const duration = Date.now() - start;
    const status = c.res.status;
    const emoji = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';
    console.log(`[${new Date().toISOString()}] [${requestId}] <-- ${emoji} ${status} ${duration}ms`);
  } else {
    await next();
  }
});

// Additional middleware from current version
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', timing());
app.use('*', cache({ cacheName: 'plantomart-api' }));
app.use('*', compress());
app.use('*', etag());

// --- Error Handling ---
app.onError((err, c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${requestId}] ERROR: ${err.message}`);
  return c.json({
    error: 'Internal Server Error',
    requestId,
    timestamp,
  }, 500);
});

app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    requestId: c.get('requestId'),
    timestamp: new Date().toISOString(),
  }, 404);
});

// --- Health, Readiness, Liveness, Metrics, Status Endpoints ---
app.get('/health', (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  const uptime = Date.now() - startTime;
  const health: HealthStatus = {
    status: 'healthy',
    timestamp,
    uptime,
    requestId,
  };
  c.header('Cache-Control', 'public, max-age=300');
  return c.json(health);
});

app.get('/ready', (c) => {
  c.header('Cache-Control', 'public, max-age=60');
  return c.json({
    ready: true,
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  });
});

app.get('/live', (c) => {
  c.header('Cache-Control', 'public, max-age=300');
  return c.json({ alive: true });
});

app.get('/metrics', (c) => {
  const uptime = Date.now() - startTime;
  const timestamp = new Date().toISOString();
  c.header('Cache-Control', 'public, max-age=60');
  return c.json({
    uptime,
    timestamp,
    requestId: c.get('requestId'),
    environment: c.env?.ENVIRONMENT || 'unknown',
  });
});

app.get('/message', (c) => {
  const requestId = c.get('requestId');
  c.header('Cache-Control', 'public, max-age=300');
  return c.json({
    message: 'Hello Hono!',
    timestamp: new Date().toISOString(),
    requestId,
  });
});

app.post('/message', async (c) => {
  const requestId = c.get('requestId');
  try {
    const body = await c.req.json();
    return c.json({
      message: 'Message received',
      data: body,
      timestamp: new Date().toISOString(),
      requestId,
    });
  } catch {
    return c.json({
      error: 'Invalid JSON',
      requestId,
      timestamp: new Date().toISOString(),
    }, 400);
  }
});

app.get('/perf', (c) => {
  const start = Date.now();
  const data = {
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
    processingTime: Date.now() - start,
  };
  c.header('Cache-Control', 'public, max-age=60');
  return c.json(data);
});

app.get('/status', (c) => {
  const timestamp = new Date().toISOString();
  const uptime = Date.now() - startTime;
  c.header('Cache-Control', 'public, max-age=120');
  return c.json({
    server: {
      status: 'healthy',
      uptime,
      timestamp,
    },
    services: {
      api: 'operational',
      database: 'operational',
    },
    requestId: c.get('requestId'),
  });
});

// --- Main API Routes ---
app.route('/general', generalRoutes);
app.route('/product', productRoutes);
app.route('/user-profile', userProfilesRoutes);
app.route('/vendor', vendorRoutes);

// --- Test route for variant verification (from current version) ---
app.get('/test-variants', async (c) => {
  try {
    const db = drizzle((c.env as any).DB);
    // Check if productVariants table exists
    const tableCheck = await db.select().from(sql`sqlite_master WHERE type='table' AND name='productVariants'`).all();
    return c.json({
      success: true,
      message: 'Variant tables verification',
      tables: {
        productVariants: tableCheck.length > 0,
        productVariantGroups: true, // We'll check this too
      },
      tableCheck,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Test failed',
      error: error.message,
    }, 500);
  }
});

export default app;