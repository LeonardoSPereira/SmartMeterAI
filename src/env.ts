import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string(),
  GEMINI_AI_MODEL: z
    .enum(['gemini-1.5-flash', 'gemini-1.5-pro'])
    .default('gemini-1.5-flash'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', _env.error.errors)

  throw new Error('Invalid environment variables')
}

export const env = _env.data
