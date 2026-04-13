import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Req, Param, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getCurrentUser } from '../auth/helpers/get-current-user';

@ApiTags('address')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async list(@Req() req: any) {
    const user = getCurrentUser(req);
    return this.addressService.list(user.id);
  }

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
    const user = getCurrentUser(req);
    return this.addressService.create(user.id, value, makeDefault ?? true);
  }

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
    const user = getCurrentUser(req);
    return this.addressService.add(user.id, value);
  }

  @Delete(':index')
  async deleteByIndex(@Req() req: any, @Param('index') index: string) {
    const user = getCurrentUser(req);
    return this.addressService.deleteByIndex(user.id, Number(index));
  }

  @Put(':index/default')
  @Patch(':index/default')
  async setDefaultByIndex(@Req() req: any, @Param('index') index: string) {
    const user = getCurrentUser(req);
    return this.addressService.setDefaultByIndex(user.id, Number(index));
  }
}
