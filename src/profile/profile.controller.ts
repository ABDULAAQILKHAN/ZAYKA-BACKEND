import { Controller, Get, Patch, Put, Delete, UseGuards, Request, Param, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Profile } from './entities/profile.entity';
import { getCurrentUser } from '../auth/helpers/get-current-user';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get profile by authenticated user ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Request() req: any) {
    const user = getCurrentUser(req);
    return this.profileService.findOne(user.id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const user = getCurrentUser(req);
    return this.profileService.update(user.id, updateProfileDto);
  }

  @Put('/theme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle theme' })
  @ApiResponse({ status: 200, description: 'Profile theme updated successfully', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  updateTheme(@Request() req: any) {
    const user = getCurrentUser(req);
    return this.profileService.updateTheme(user.id);
  }

  @Get('/theme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user theme' })
  @ApiResponse({ status: 200, description: 'Profile theme fetched successfully', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getTheme(@Request() req: any) {
    const user = getCurrentUser(req);
    return this.profileService.getTheme(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  remove(@Param('id') id: string) {
    return this.profileService.remove(id);
  }
}
