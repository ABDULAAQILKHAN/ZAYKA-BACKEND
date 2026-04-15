import { Controller, Get, Post, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { Session, SessionStatus } from './entities/session.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiResponse({ status: 200, type: [Session] })
  findAll(@Query('status') status?: SessionStatus) {
    return this.sessionsService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get session by ID with orders' })
  @ApiResponse({ status: 200, type: Session })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Close a session' })
  @ApiResponse({ status: 200, type: Session })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.closeSession(id);
  }
}