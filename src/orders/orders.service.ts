import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto, OrderType } from './dto';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { ProfileService } from '../profile/profile.service';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { SessionsService } from '../sessions/sessions.service';
import { InvoicesService } from '../invoices/invoices.service';
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
    private readonly menuItemsService: MenuItemsService,
    private readonly sessionsService: SessionsService,
    private readonly invoicesService: InvoicesService,
  ) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { orderType, items, tableId, addressId, deliveryInstructions } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order items are required.');
    }

    // 1. Fetch menu items to get real prices
    const itemIds = items.map(i => i.id);
    const menuItems = await Promise.all(itemIds.map(id => this.menuItemsService.findOne(id)));
    
    const orderItemsWithPrice = items.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.id);
      if (!menuItem) throw new NotFoundException(`Menu item ${item.id} not found`);
      
      const price = item.size === 'Half' && menuItem.halfPrice ? menuItem.halfPrice : menuItem.fullPrice;
      
      return {
        ...item,
        name: menuItem.name,
        price,
        image: menuItem.image,
      };
    });

    // 2. Calculate totals
    const subtotal = orderItemsWithPrice.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const deliveryFee = orderType === OrderType.DELIVERY ? DELIVERY_FEE : 0;
    const total = subtotal + tax + deliveryFee;

    // 3. Handle Address for delivery
    let deliveryAddress = 'Dine-in';
    if (orderType === OrderType.DELIVERY) {
      if (!addressId) throw new BadRequestException('Address ID is required for delivery orders');
      const addresses = await this.addressService.list(userId);
      const address = addresses.find((a) => a.id === addressId);
      if (!address) throw new NotFoundException(`Address with ID ${addressId} not found`);
      deliveryAddress = address.value;
    } else if (orderType === OrderType.TAKEAWAY) {
      deliveryAddress = 'Takeaway';
    }

    // 4. Handle Session for table orders
    let sessionId: string | null = null;
    if (orderType === OrderType.TABLE) {
      if (!tableId) throw new BadRequestException('Table ID is required for table orders');
      const session = await this.sessionsService.findOrCreateActiveSession(tableId);
      sessionId = session.id;
    }

    const profile = await this.profileService.findOne(userId);

    const estimatedCompletionTime = new Date();
    estimatedCompletionTime.setMinutes(estimatedCompletionTime.getMinutes() + ESTIMATED_PREP_TIME_MINUTES);

    // 5. Create Order
    const { data: orderData, error: orderError } = await this.client
      .from('orders')
      .insert({
        user_id: userId,
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        total,
        status: OrderStatus.PENDING,
        order_type: orderType,
        table_id: tableId || null,
        session_id: sessionId,
        delivery_address: deliveryAddress,
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

    // 6. Create Order Items
    const orderItemsPayload = orderItemsWithPrice.map((item) => ({
      order_id: orderData.id,
      menu_item_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size || 'Full',
      image: item.image,
    }));

    const { error: itemsError } = await this.client.from('order_items').insert(orderItemsPayload);
    handleSupabaseError(itemsError, 'Failed to create order items');

    return this.findOne(orderData.id, userId);
  }

  async createTakeawayOrder(userId: string, createOrderDto: CreateOrderDto): Promise<any> {
    if (createOrderDto.orderType !== OrderType.TAKEAWAY) {
      throw new BadRequestException('Invalid order type for takeaway endpoint');
    }

    // 1. Create the order
    const order = await this.create(userId, createOrderDto);

    // 2. Mark as delivered (takeaway is immediate or already picked up)
    const { data: updatedOrder, error: updateError } = await this.client
      .from('orders')
      .update({ status: OrderStatus.DELIVERED })
      .eq('id', order.id)
      .select()
      .single();
    
    handleSupabaseError(updateError, 'Failed to update takeaway order status');

    // 3. Generate invoice
    const invoice = await this.invoicesService.create({
      referenceId: order.id,
      referenceType: 'order',
      paymentMethod: 'cash', // Default for takeaway
    });

    return {
      order: mapOrderRow(updatedOrder),
      invoice,
    };
  }

  async findActiveOrders(): Promise<Order[]> {
    const activeStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.OUT_FOR_DELIVERY,
    ];

    const { data, error } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .in('status', activeStatuses)
      .order('created_at', { ascending: true });

    handleSupabaseError(error, 'Failed to fetch active orders');
    return (data ?? []).map(mapOrderRow) as Order[];
  }

  async findOrderHistory(): Promise<Order[]> {
    const historyStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

    const { data, error } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .in('status', historyStatuses)
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'Failed to fetch order history');
    return (data ?? []).map(mapOrderRow) as Order[];
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
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.SERVED]: [OrderStatus.DELIVERED],
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
