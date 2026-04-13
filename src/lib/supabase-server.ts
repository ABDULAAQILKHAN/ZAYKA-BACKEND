import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getRequired(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function createServerClient(
  configService: ConfigService,
  accessToken?: string,
): SupabaseClient {
  const supabaseUrl = getRequired(configService, 'SUPABASE_URL');
  const supabaseAnonKey = getRequired(configService, 'SUPABASE_ANON_KEY');

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminClient(configService: ConfigService): SupabaseClient {
  const supabaseUrl = getRequired(configService, 'SUPABASE_URL');
  const serviceRoleKey = getRequired(configService, 'SUPABASE_SERVICE_ROLE_KEY');

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
