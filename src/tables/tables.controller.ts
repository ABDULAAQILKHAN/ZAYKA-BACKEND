import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, TableQueryDto } from './dto';
import { Table } from './entities/table.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully', type: [Table] })
  findAll(@Query() query: TableQueryDto) {
    return this.tablesService.findAll(query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a table by ID' })
  @ApiResponse({ status: 200, description: 'Table retrieved successfully', type: Table })
  @ApiResponse({ status: 404, description: 'Table not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new table (Admin only)' })
  @ApiResponse({ status: 201, description: 'Table created successfully', type: Table })
  @ApiResponse({ status: 400, description: 'Table number already exists' })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a table (Admin only)' })
  @ApiResponse({ status: 200, description: 'Table updated successfully', type: Table })
  @ApiResponse({ status: 404, description: 'Table not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a table (Admin only)' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.remove(id);
  }
}