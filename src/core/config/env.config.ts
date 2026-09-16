import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DISCORD_BOT_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID is required'),
  MONGO_URI: z.string().min(1, 'MongoDB URI is required').refine(
    (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
    'MongoDB URI must start with mongodb:// or mongodb+srv://'
  ),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  FEEDBACK_WEBHOOK_URL: z.string().url().optional(),
  TOPGG_TOKEN: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const config = parseEnv();

