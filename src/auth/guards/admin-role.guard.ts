import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has role in user_metadata (Supabase JWT structure)
    const userRole = user.user_metadata?.role;

    if (!userRole) {
      throw new ForbiddenException('User role not found in token');
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      throw new ForbiddenException(`Access denied. Required role: ${requiredRoles.join(', ')}, but user has role: ${userRole}`);
    }

    return true;
  }
}
