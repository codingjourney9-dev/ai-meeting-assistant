


import dotenv from 'dotenv'

dotenv.config()

export const env = Object.freeze({
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',

  
  MONGODB_URI: process.env.MONGODB_URI || '',

  
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || '',

  
  ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY || '',
  
  TRANSCRIPTION_PROVIDER: process.env.TRANSCRIPTION_PROVIDER || 'deepgram',

  
  

  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@example.com',
  
  ACTION_ITEM_RECIPIENTS: process.env.ACTION_ITEM_RECIPIENTS || '',
})
