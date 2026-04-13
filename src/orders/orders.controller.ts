import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getCurrentUser } from '../auth/helpers/get-current-user';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid data' })
  @ApiResponse({ status: 404, description: 'Address or profile not found' })
  async create(@Request() req: any, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
    const user = getCurrentUser(req);
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my orders (customer)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully', type: [Order] })
  async findMyOrders(@Request() req: any): Promise<Order[]> {
    const user = getCurrentUser(req);
    return this.ordersService.findMyOrders(user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders (admin/staff)' })
  @ApiResponse({ status: 200, description: 'All orders retrieved successfully', type: [Order] })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<Order> {
    const user = getCurrentUser(req);
    return this.ordersService.findOne(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order status (admin/staff)' })
  @ApiResponse({ status: 200, description: 'Order status updated', type: Order })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel an order (customer)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancel(@Request() req: any, @Param('id') id: string): Promise<Order> {
    const user = getCurrentUser(req);
    return this.ordersService.cancel(id, user.id);
  }

  @Get('rider/ready')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('rider', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get orders ready for delivery (rider)' })
  @ApiResponse({ status: 200, description: 'Ready orders retrieved successfully', type: [Order] })
  async getReadyOrders(): Promise<Order[]> {
    return this.ordersService.findByStatus('ready');
  }

  @Get('rider/my-deliveries')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('rider', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get orders out for delivery (rider)' })
  @ApiResponse({ status: 200, description: 'Out for delivery orders retrieved successfully', type: [Order] })
  async getOutForDeliveryOrders(): Promise<Order[]> {
    return this.ordersService.findByStatus('out-for-delivery');
  }

  @Patch('rider/:id/pickup')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('rider', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark order as picked up / out for delivery (rider)' })
  @ApiResponse({ status: 200, description: 'Order marked as out for delivery', type: Order })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async pickupOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.updateStatus(id, { status: 'out-for-delivery' as any });
  }

  @Patch('rider/:id/deliver')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Roles('rider', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark order as delivered (rider)' })
  @ApiResponse({ status: 200, description: 'Order marked as delivered', type: Order })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deliverOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.updateStatus(id, { status: 'delivered' as any });
  }
}
