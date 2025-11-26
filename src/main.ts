import { webcrypto as crypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = crypto as Crypto;

import { AppFactory } from './AppFactory';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const { app } = await AppFactory.create();
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  await app.listen(4000);
  console.log(`🚀 Running at http://localhost:${4000}`);
}
const vercel = false
// Run bootstrap only if not on Vercel
if (!vercel) {
  console.log('Not on Vercel, starting server...'); 
  bootstrap();
}

// Export handler for Vercel
export default async function handler(req, res) {
  const { app, expressApp } = await AppFactory.create();
  await app.init();
  return expressApp(req, res);
}
