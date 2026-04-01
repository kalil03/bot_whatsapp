import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PREFIX: z.string().default('!'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  BOT_CLIENT_ID: z.string().default('bot-principal'),
  ALLOW_FROM_ME: z.string().transform((val) => val === 'true').default('true'),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment Variables Error:', parseResult.error.format());
  process.exit(1);
}

export const config = parseResult.data;
