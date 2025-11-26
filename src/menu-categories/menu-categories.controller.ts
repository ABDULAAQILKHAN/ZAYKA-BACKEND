import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  ParseBoolPipe
} from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MenuCategory } from './entities/menu-category.entity';

@ApiTags('Menu Categories')
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new menu category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: MenuCategory })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createMenuCategoryDto: CreateMenuCategoryDto) {
    return this.menuCategoriesService.create(createMenuCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu categories' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: [MenuCategory] })
  findAll(@Query('active') active?: string) {
    const activeOnly = active === 'true' ? true : undefined;
    return this.menuCategoriesService.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: MenuCategory })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.menuCategoriesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a menu category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: MenuCategory })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  update(@Param('id') id: string, @Body() updateMenuCategoryDto: UpdateMenuCategoryDto) {
    return this.menuCategoriesService.update(id, updateMenuCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a menu category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  remove(@Param('id') id: string) {
    return this.menuCategoriesService.remove(id);
  }
}
