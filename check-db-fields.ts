import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ConfigService } from '@nestjs/config';
import { createAdminClient } from './src/lib/supabase-server';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);
  const supabase = createAdminClient(config);
  const { data, error } = await supabase.from('tables').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
  await app.close();
}
bootstrap();
