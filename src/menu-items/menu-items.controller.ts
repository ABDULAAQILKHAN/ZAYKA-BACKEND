import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MenuItem } from './entities/menu-item.entity';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new menu item (Admin only)' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully', type: MenuItem })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.create(createMenuItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items with optional filters' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'available', required: false, type: Boolean, description: 'Filter by availability status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name and description' })
  @ApiResponse({ status: 200, description: 'Menu items retrieved successfully', type: [MenuItem] })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('available') available?: string,
    @Query('search') search?: string
  ) {
    const availableBoolean = available === 'true' ? true : available === 'false' ? false : undefined;
    return this.menuItemsService.findAll(categoryId, availableBoolean, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiResponse({ status: 200, description: 'Menu item retrieved successfully', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a menu item (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  update(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin', 'manager', 'staff')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle menu item availability (Admin only)' })
  @ApiResponse({ status: 200, description: 'Availability toggled successfully', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  toggleAvailability(@Param('id') id: string) {
    return this.menuItemsService.toggleAvailability(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a menu item (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}
