import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseBoolPipe,
  ParseUUIDPipe,
  UseGuards 
} from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SpecialOffersService } from './special-offers.service';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';
import { UpdateSpecialOfferDto } from './dto/update-special-offer.dto';
import { SpecialOffer } from './entities/special-offer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Special Offers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Roles('admin')
@Controller('special-offers')
export class SpecialOffersController {
  constructor(private readonly specialOffersService: SpecialOffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new special offer' })
  @ApiResponse({ status: 201, description: 'Special offer created successfully', type: SpecialOffer })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createSpecialOfferDto: CreateSpecialOfferDto): Promise<SpecialOffer> {
    return this.specialOffersService.create(createSpecialOfferDto);
  }

  @Get()
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get all special offers (Public endpoint)' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of special offers', type: [SpecialOffer] })
  async findAll(@Query('active', new ParseBoolPipe({ optional: true })) active?: boolean): Promise<SpecialOffer[]> {
    return this.specialOffersService.findAll(active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a special offer by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Special offer UUID' })
  @ApiResponse({ status: 200, description: 'Special offer found', type: SpecialOffer })
  @ApiResponse({ status: 404, description: 'Special offer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SpecialOffer> {
    return this.specialOffersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a special offer' })
  @ApiParam({ name: 'id', type: String, description: 'Special offer UUID' })
  @ApiResponse({ status: 200, description: 'Special offer updated successfully', type: SpecialOffer })
  @ApiResponse({ status: 404, description: 'Special offer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSpecialOfferDto: UpdateSpecialOfferDto,
  ): Promise<SpecialOffer> {
    return this.specialOffersService.update(id, updateSpecialOfferDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a special offer' })
  @ApiParam({ name: 'id', type: String, description: 'Special offer UUID' })
  @ApiResponse({ status: 200, description: 'Special offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Special offer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.specialOffersService.remove(id);
  }
}
