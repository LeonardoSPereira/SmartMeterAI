import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'

import { env } from '../env'

export const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)
export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
