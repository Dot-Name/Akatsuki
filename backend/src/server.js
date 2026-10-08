import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
for (const k of ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']) if (!process.env[k]) { console.error(`Missing env var ${k}`); process.exit(1); }
await connectDB();
app.listen(process.env.PORT || 10000, () => console.log('API running'));
