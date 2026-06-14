import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth';
import otpRoutes from './routes/otp';

const app = express();

app.use(
  cors({
    origin: process.env.PUBLIC_CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

app.use('/api/auth/otp', otpRoutes);
app.all('/api/auth/{*any}', toNodeHandler(auth));

app.get('/', (_, res) => {
  res.json({
    message: 'Welcome to the Auth Server',
  });
});

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
  });
});

const PORT = Number(process.env.AUTH_SERVER_PORT ?? 3001);

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
