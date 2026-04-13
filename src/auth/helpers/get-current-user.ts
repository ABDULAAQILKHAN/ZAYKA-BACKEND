import { UnauthorizedException } from '@nestjs/common';
import { User } from '@supabase/supabase-js';

export function getCurrentUser(request: any): User {
  const user = request?.user as User | undefined;

  if (!user?.id) {
    throw new UnauthorizedException('Authenticated user not found on request');
  }

  return user;
}
