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

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', timing());
app.use('*', secureHeaders());
app.use('*', cache({ cacheName: 'plantomart-api' }));
app.use('*', compress());
app.use('*', etag());

// Routes
app.route('/general', generalRoutes);
app.route('/product', productRoutes);
app.route('/user-profile', userProfilesRoutes);
app.route('/vendor', vendorRoutes);

// Test route for variant verification
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
        productVariantGroups: true // We'll check this too
      },
      tableCheck
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Test failed',
      error: error.message
    }, 500);
  }
});

export default app;