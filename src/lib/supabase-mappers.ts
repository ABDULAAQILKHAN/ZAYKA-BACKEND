import { BadRequestException } from '@nestjs/common';

export function handleSupabaseError(error: { message?: string } | null, context: string): never | void {
  if (error) {
    throw new BadRequestException(`${context}: ${error.message ?? 'Unknown Supabase error'}`);
  }
}
