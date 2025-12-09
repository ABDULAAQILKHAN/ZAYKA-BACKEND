import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Req, Param, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AddressesDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('address')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // List addresses for authenticated user
  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.sub;
    return await this.addressService.list(userId);
  }

  // Create new address
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', example: '123 Main St, Mumbai' },
        makeDefault: { type: 'boolean', example: true },
      },
      required: ['value'],
    },
  })
  async create(@Req() req: any, @Body('value') value: string, @Body('makeDefault') makeDefault?: boolean) {
    const userId = req.user?.sub;
  // Requirement: creation sets default, ignoring makeDefault
  return await this.addressService.create(userId, value, true);
  }

  // Add new address for same user (PUT/PATCH)
  @Put()
  @Patch()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', example: '456 Park Ave, Delhi' },
      },
      required: ['value'],
    },
  })
  async add(@Req() req: any, @Body('value') value: string) {
    const userId = req.user?.sub;
    return await this.addressService.add(userId, value);
  }

  // Delete an address by index
  @Delete(':index')
  async deleteByIndex(@Req() req: any, @Param('index') index: string) {
    const userId = req.user?.sub;
    return await this.addressService.deleteByIndex(userId, Number(index));
  }

  // Mark existing address default by index
  @Put(':index/default')
  @Patch(':index/default')
  async setDefaultByIndex(@Req() req: any, @Param('index') index: string) {
    const userId = req.user?.sub;
    return await this.addressService.setDefaultByIndex(userId, Number(index));
  }
}
