import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { requestId } from "hono/request-id";

// Types for CloudflareBindings
interface CloudflareBindings {
  // Add your Cloudflare bindings here
  // Example: MY_KV: KVNamespace;
}

// Health check response interface
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  requestId: string;
  checks: {
    memory: { status: 'ok' | 'warning' | 'critical'; usage?: number };
    dependencies: { status: 'ok' | 'warning' | 'critical'; message?: string };
  };
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Store startup time for uptime calculation
const startTime = Date.now();

// Request ID middleware - adds unique ID to each request
app.use('*', requestId());

// Security headers middleware (similar to Helmet)
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
  crossOriginResourcePolicy: 'cross-origin',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginEmbedderPolicy: 'require-corp',
  originAgentCluster: '?1',
  referrerPolicy: 'no-referrer',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xContentTypeOptions: 'nosniff',
  xDnsPrefetchControl: 'off',
  xDownloadOptions: 'noopen',
  xFrameOptions: 'DENY',
  xPermittedCrossDomainPolicies: 'none',
  xXssProtection: '0',
}));

// Timing middleware - adds server timing headers
app.use('*', timing());

// Logger middleware (similar to Morgan)
app.use('*', logger((message, ...rest) => {
  // Custom logger format with additional context
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...rest);
}));

// CORS middleware
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://your-domain.com", // Add your production domain
      ];
      
      // Allow requests with no origin (like curl or Postman)
      if (!origin) return "*";

      return allowedOrigins.includes(origin) ? origin : "";
    },
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    allowMethods: ['GET', 'POST','PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 600,
    credentials: true
  })
);

// Custom logging middleware for detailed request/response logging
app.use('*', async (c, next) => {
  const requestId = c.get('requestId');
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`[${new Date().toISOString()}] [${requestId}] --> ${c.req.method} ${c.req.url}`);
  
  // Log request headers in development
  if (c.env?.ENVIRONMENT === 'development') {
    console.log(`[${new Date().toISOString()}] [${requestId}] Headers:`, Object.fromEntries(c.req.raw.headers));
  }
  
  await next();
  
  // Log response
  const duration = Date.now() - startTime;
  const status = c.res.status;
  const statusEmoji = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';
  
  console.log(`[${new Date().toISOString()}] [${requestId}] <-- ${statusEmoji} ${status} ${c.req.method} ${c.req.url} ${duration}ms`);
});

// Error handling middleware
app.onError((err, c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] [${requestId}] 🔥 ERROR: ${err.message}`);
  console.error(`[${timestamp}] [${requestId}] Stack: ${err.stack}`);
  
  return c.json(
    {
      error: 'Internal Server Error',
      requestId,
      timestamp,
      message: c.env?.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${requestId}] 🔍 404 Not Found: ${c.req.method} ${c.req.url}`);
  
  return c.json(
    {
      error: 'Not Found',
      requestId,
      timestamp,
      path: c.req.path,
      method: c.req.method
    },
    404
  );
});

// Health check endpoint with comprehensive status
app.get("/health", async (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  const uptime = Date.now() - startTime;
  
  try {
    // Simulate memory check (in Cloudflare Workers, this is limited)
    const memoryCheck = {
      status: 'ok' as const,
      usage: Math.floor(Math.random() * 100) // Placeholder - Workers don't expose real memory usage
    };
    
    // Simulate dependency checks
    const dependencyCheck = {
      status: 'ok' as const,
      message: 'All dependencies operational'
    };
    
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp,
      uptime,
      version: '1.0.0', // You can read this from package.json or env
      environment: c.env?.ENVIRONMENT || 'unknown',
      requestId,
      checks: {
        memory: memoryCheck,
        dependencies: dependencyCheck
      }
    };
    
    console.log(`[${timestamp}] [${requestId}] ✅ Health check passed`);
    
    return c.json(healthStatus, 200);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`[${timestamp}] [${requestId}] ❌ Health check failed: ${errorMessage}`);
    
    const unhealthyStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp,
      uptime,
      version: '1.0.0',
      environment: c.env?.ENVIRONMENT || 'unknown',
      requestId,
      checks: {
        memory: { status: 'critical' },
        dependencies: { status: 'critical', message: errorMessage }
      }
    };
    
    return c.json(unhealthyStatus, 503);
  }
});

// Readiness check endpoint
app.get("/ready", (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${requestId}] 🚀 Readiness check`);
  
  return c.json({
    ready: true,
    timestamp,
    requestId,
    uptime: Date.now() - startTime
  });
});

// Liveness probe endpoint
app.get("/live", (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${requestId}] 💓 Liveness check`);
  
  return c.json({
    alive: true,
    timestamp,
    requestId
  });
});

// Metrics endpoint (basic)
app.get("/metrics", (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  const uptime = Date.now() - startTime;
  
  console.log(`[${timestamp}] [${requestId}] 📊 Metrics requested`);
  
  return c.json({
    uptime,
    timestamp,
    requestId,
    version: '1.0.0',
    environment: c.env?.ENVIRONMENT || 'unknown'
  });
});

// Your existing message endpoint with enhanced logging
app.get("/message", (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${requestId}] 📝 Message endpoint accessed`);
  
  return c.json({
    message: "Hello Hono!",
    timestamp,
    requestId,
    uptime: Date.now() - startTime
  });
});

// Example POST endpoint with request body logging
app.post("/message", async (c) => {
  const requestId = c.get('requestId');
  const timestamp = new Date().toISOString();
  
  try {
    const body = await c.req.json();
    
    console.log(`[${timestamp}] [${requestId}] 📝 POST message received:`, body);
    
    return c.json({
      message: "Message received successfully",
      data: body,
      timestamp,
      requestId
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    
    console.error(`[${timestamp}] [${requestId}] ❌ POST message error: ${errorMessage}`);
    
    return c.json({
      error: "Invalid JSON payload",
      timestamp,
      requestId
    }, 400);
  }
});

// Graceful startup log
console.log(`[${new Date().toISOString()}] 🚀 Hono server starting...`);
console.log(`[${new Date().toISOString()}] 🔧 Environment: ${typeof process !== 'undefined' ? process.env.NODE_ENV : 'cloudflare-workers'}`);

export default app;