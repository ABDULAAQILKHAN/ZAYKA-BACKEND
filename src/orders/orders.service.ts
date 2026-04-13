import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { ProfileService } from '../profile/profile.service';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapOrderRow } from '../lib/supabase-mappers';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;
const ESTIMATED_PREP_TIME_MINUTES = 45;

@Injectable()
export class OrdersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    private readonly profileService: ProfileService,
  ) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { addressId, deliveryInstructions } = createOrderDto;

    const cartItems = await this.cartService.getCart(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cart is empty. Add items before placing an order.');
    }

    const addresses = await this.addressService.list(userId);
    const address = addresses.find((a) => a.id === addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    const profile = await this.profileService.findOne(userId);

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;

    const estimatedCompletionTime = new Date();
    estimatedCompletionTime.setMinutes(estimatedCompletionTime.getMinutes() + ESTIMATED_PREP_TIME_MINUTES);

    const { data: orderData, error: orderError } = await this.client
      .from('orders')
      .insert({
        user_id: userId,
        subtotal,
        tax,
        delivery_fee: DELIVERY_FEE,
        total,
        status: OrderStatus.PENDING,
        delivery_address: address.value,
        delivery_instructions: deliveryInstructions || null,
        customer_name: profile.name || 'Customer',
        customer_phone: profile.phone || '',
        estimated_completion_time: estimatedCompletionTime.toISOString(),
      })
      .select('id')
      .single();

    handleSupabaseError(orderError, 'Failed to create order');
    if (!orderData?.id) {
      throw new BadRequestException('Failed to create order: missing order id in response');
    }

    const orderItemsPayload = cartItems.map((cartItem) => ({
      order_id: orderData.id,
      menu_item_id: cartItem.id,
      name: cartItem.name,
      quantity: cartItem.quantity,
      price: cartItem.price,
      size: cartItem.size,
      image: cartItem.image,
    }));

    const { error: itemsError } = await this.client.from('order_items').insert(orderItemsPayload);
    handleSupabaseError(itemsError, 'Failed to create order items');

    await this.cartService.clearCart(userId);

    return this.findOne(orderData.id, userId);
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    const { data, error } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'Failed to fetch user orders');
    return (data ?? []).map(mapOrderRow) as Order[];
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'Failed to fetch all orders');
    return (data ?? []).map(mapOrderRow) as Order[];
  }

  async findByStatus(status: string): Promise<Order[]> {
    const { data, error } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', status)
      .order('created_at', { ascending: true });

    handleSupabaseError(error, 'Failed to fetch orders by status');
    return (data ?? []).map(mapOrderRow) as Order[];
  }

  async findOne(orderId: string, userId?: string): Promise<Order> {
    let query = this.client.from('orders').select('*, order_items(*)').eq('id', orderId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return mapOrderRow(data) as Order;
  }

  async updateStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(orderId);
    this.validateStatusTransition(order.status as OrderStatus, updateStatusDto.status);

    const { data, error } = await this.client
      .from('orders')
      .update({ status: updateStatusDto.status })
      .eq('id', orderId)
      .select('id')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.findOne(orderId);
  }

  async cancel(orderId: string, userId: string): Promise<Order> {
    const order = await this.findOne(orderId, userId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order. Order is already ${order.status}. Only pending orders can be cancelled.`,
      );
    }

    const { data, error } = await this.client
      .from('orders')
      .update({ status: OrderStatus.CANCELLED })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.findOne(orderId, userId);
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}
