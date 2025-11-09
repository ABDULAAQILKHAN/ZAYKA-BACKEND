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
import { TodaysSpecialsService } from './todays-specials.service';
import { CreateTodaysSpecialDto } from './dto/create-todays-special.dto';
import { UpdateTodaysSpecialDto } from './dto/update-todays-special.dto';
import { TodaysSpecial } from './entities/todays-special.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Todays Specials')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Roles('admin')
@Controller('todays-specials')
export class TodaysSpecialsController {
  constructor(private readonly todaysSpecialsService: TodaysSpecialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new today\'s special' })
  @ApiResponse({ status: 201, description: 'Today\'s special created successfully', type: TodaysSpecial })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createTodaysSpecialDto: CreateTodaysSpecialDto): Promise<TodaysSpecial> {
    return this.todaysSpecialsService.create(createTodaysSpecialDto);
  }

  @Get()
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get all today\'s specials (Public endpoint)' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of today\'s specials', type: [TodaysSpecial] })
  async findAll(@Query('active', new ParseBoolPipe({ optional: true })) active?: boolean): Promise<TodaysSpecial[]> {
    return this.todaysSpecialsService.findAll(active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a today\'s special by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Today\'s special UUID' })
  @ApiResponse({ status: 200, description: 'Today\'s special found', type: TodaysSpecial })
  @ApiResponse({ status: 404, description: 'Today\'s special not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TodaysSpecial> {
    return this.todaysSpecialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a today\'s special' })
  @ApiParam({ name: 'id', type: String, description: 'Today\'s special UUID' })
  @ApiResponse({ status: 200, description: 'Today\'s special updated successfully', type: TodaysSpecial })
  @ApiResponse({ status: 404, description: 'Today\'s special not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodaysSpecialDto: UpdateTodaysSpecialDto,
  ): Promise<TodaysSpecial> {
    return this.todaysSpecialsService.update(id, updateTodaysSpecialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a today\'s special' })
  @ApiParam({ name: 'id', type: String, description: 'Today\'s special UUID' })
  @ApiResponse({ status: 200, description: 'Today\'s special deleted successfully' })
  @ApiResponse({ status: 404, description: 'Today\'s special not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.todaysSpecialsService.remove(id);
  }
}
