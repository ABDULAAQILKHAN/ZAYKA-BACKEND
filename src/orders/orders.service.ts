import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { ProfileService } from '../profile/profile.service';

// Constants for order calculation
const TAX_RATE = 0.05; // 5% tax
const DELIVERY_FEE = 40; // Fixed delivery fee
const ESTIMATED_PREP_TIME_MINUTES = 45; // 45 minutes

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * Create a new order from user's cart
   */
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { addressId, deliveryInstructions } = createOrderDto;

    // Get user's cart
    const cartItems = await this.cartService.getCart(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cart is empty. Add items before placing an order.');
    }

    // Get delivery address
    const addresses = await this.addressService.list(userId);
    const address = addresses.find(a => a.id === addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    // Get user profile for customer info
    const profile = await this.profileService.findOne(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;

    // Calculate estimated completion time
    const estimatedCompletionTime = new Date();
    estimatedCompletionTime.setMinutes(estimatedCompletionTime.getMinutes() + ESTIMATED_PREP_TIME_MINUTES);

    // Create order
    const order = this.orderRepository.create({
      userId,
      subtotal,
      tax,
      deliveryFee: DELIVERY_FEE,
      total,
      status: OrderStatus.PENDING,
      deliveryAddress: address.value,
      deliveryInstructions: deliveryInstructions || undefined,
      customerName: profile.name || 'Customer',
      customerPhone: profile.phone || '',
      estimatedCompletionTime,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items from cart
    const orderItems = cartItems.map(cartItem => 
      this.orderItemRepository.create({
        orderId: (savedOrder as Order).id,
        menuItemId: cartItem.id,
        name: cartItem.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
        size: cartItem.size,
        image: cartItem.image,
      })
    );

    await this.orderItemRepository.save(orderItems);

    // Clear user's cart after successful order
    await this.cartService.clearCart(userId);

    // Fetch and return the complete order with items
    return this.findOne((savedOrder as Order).id, userId);
  }

  /**
   * Get all orders for a user
   */
  async findMyOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all orders (admin)
   */
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single order by ID
   */
  async findOne(orderId: string, userId?: string): Promise<Order> {
    const whereClause: any = { id: orderId };
    if (userId) {
      whereClause.userId = userId;
    }

    const order = await this.orderRepository.findOne({
      where: whereClause,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  /**
   * Update order status (admin)
   */
  async updateStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(order.status, updateStatusDto.status);

    order.status = updateStatusDto.status;
    await this.orderRepository.save(order);

    return this.findOne(orderId);
  }

  /**
   * Cancel an order (customer)
   */
  async cancel(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order. Order is already ${order.status}. Only pending orders can be cancelled.`
      );
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    return this.findOne(orderId, userId);
  }

  /**
   * Validate order status transitions
   */
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
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
