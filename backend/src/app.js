import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import routes from './routes/index.js';
import { csrfGuard, notFound, errorHandler } from './middleware/index.js';

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', csrfGuard, routes);
app.use(notFound); app.use(errorHandler);
export default app;
