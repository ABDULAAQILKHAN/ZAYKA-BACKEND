import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get minimal menu list' })
  @ApiQuery({ name: 'availableOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Menu list retrieved successfully' })
  async getMinimalMenu(@Query('availableOnly') availableOnly?: string) {
    const items = await this.menuItemsService.findAll(
      undefined, 
      availableOnly === 'true' ? true : undefined
    );
    
    return items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.fullPrice,
      is_available: item.isAvailable,
    }));
  }
}