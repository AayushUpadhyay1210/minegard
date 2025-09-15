import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify auth
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) return null;
  
  return user;
}

// User signup endpoint
app.post("/make-server-f80a1713/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup processing error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get sensor data
app.get("/make-server-f80a1713/sensors", async (c) => {
  try {
    // Get existing sensors or create mock data
    let sensors = await kv.get('sensors');
    
    if (!sensors) {
      // Create initial mock sensor data
      sensors = [
        {
          id: '1',
          name: 'Temperature Sensor A1',
          type: 'temperature',
          location: 'Tunnel A - Section 1',
          value: 24.5,
          unit: '°C',
          status: 'active',
          lastUpdate: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Gas Detector B2',
          type: 'gas',
          location: 'Tunnel B - Section 2',
          value: 0.02,
          unit: 'ppm',
          status: 'active',
          lastUpdate: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Pressure Monitor C1',
          type: 'pressure',
          location: 'Main Shaft',
          value: 101.3,
          unit: 'kPa',
          status: 'warning',
          lastUpdate: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Vibration Sensor D1',
          type: 'vibration',
          location: 'Equipment Bay 1',
          value: 2.1,
          unit: 'mm/s',
          status: 'active',
          lastUpdate: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Air Quality Monitor E1',
          type: 'air_quality',
          location: 'Ventilation Shaft',
          value: 85,
          unit: 'AQI',
          status: 'active',
          lastUpdate: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Water Level Sensor F1',
          type: 'water_level',
          location: 'Sump Area',
          value: 1.2,
          unit: 'm',
          status: 'critical',
          lastUpdate: new Date().toISOString()
        }
      ];
      
      await kv.set('sensors', sensors);
    }

    // Simulate real-time updates
    sensors = sensors.map(sensor => ({
      ...sensor,
      value: parseFloat((sensor.value + (Math.random() - 0.5) * 2).toFixed(2)),
      lastUpdate: new Date().toISOString()
    }));
    
    await kv.set('sensors', sensors);

    return c.json({ sensors });
  } catch (error) {
    console.log(`Error fetching sensors: ${error}`);
    return c.json({ error: 'Failed to fetch sensor data' }, 500);
  }
});

// Get alerts
app.get("/make-server-f80a1713/alerts", async (c) => {
  try {
    let alerts = await kv.get('alerts');
    
    if (!alerts) {
      alerts = [
        {
          id: '1',
          severity: 'critical',
          message: 'Water level critically high in Sump Area',
          sensor: 'Water Level Sensor F1',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          acknowledged: false
        },
        {
          id: '2',
          severity: 'warning',
          message: 'Pressure reading above normal threshold',
          sensor: 'Pressure Monitor C1',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          acknowledged: false
        },
        {
          id: '3',
          severity: 'info',
          message: 'Routine maintenance scheduled for Equipment Bay 1',
          sensor: 'System',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          acknowledged: true
        }
      ];
      
      await kv.set('alerts', alerts);
    }

    return c.json({ alerts });
  } catch (error) {
    console.log(`Error fetching alerts: ${error}`);
    return c.json({ error: 'Failed to fetch alerts' }, 500);
  }
});

// Add new sensor
app.post("/make-server-f80a1713/sensors", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sensorData = await c.req.json();
    let sensors = await kv.get('sensors') || [];
    
    const newSensor = {
      id: Date.now().toString(),
      ...sensorData,
      status: 'active',
      lastUpdate: new Date().toISOString()
    };
    
    sensors.push(newSensor);
    await kv.set('sensors', sensors);

    return c.json({ sensor: newSensor });
  } catch (error) {
    console.log(`Error adding sensor: ${error}`);
    return c.json({ error: 'Failed to add sensor' }, 500);
  }
});

// Update sensor
app.put("/make-server-f80a1713/sensors/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sensorId = c.req.param('id');
    const updateData = await c.req.json();
    let sensors = await kv.get('sensors') || [];
    
    const sensorIndex = sensors.findIndex(s => s.id === sensorId);
    if (sensorIndex === -1) {
      return c.json({ error: 'Sensor not found' }, 404);
    }
    
    sensors[sensorIndex] = {
      ...sensors[sensorIndex],
      ...updateData,
      lastUpdate: new Date().toISOString()
    };
    
    await kv.set('sensors', sensors);

    return c.json({ sensor: sensors[sensorIndex] });
  } catch (error) {
    console.log(`Error updating sensor: ${error}`);
    return c.json({ error: 'Failed to update sensor' }, 500);
  }
});

// Acknowledge alert
app.put("/make-server-f80a1713/alerts/:id/acknowledge", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const alertId = c.req.param('id');
    let alerts = await kv.get('alerts') || [];
    
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      return c.json({ error: 'Alert not found' }, 404);
    }
    
    alerts[alertIndex].acknowledged = true;
    alerts[alertIndex].acknowledgedBy = user.id;
    alerts[alertIndex].acknowledgedAt = new Date().toISOString();
    
    await kv.set('alerts', alerts);

    return c.json({ alert: alerts[alertIndex] });
  } catch (error) {
    console.log(`Error acknowledging alert: ${error}`);
    return c.json({ error: 'Failed to acknowledge alert' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-f80a1713/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);