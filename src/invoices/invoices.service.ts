import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

const TAX_RATE = 0.05; // 5% GST

@Injectable()
export class InvoicesService {
  constructor(private readonly configService: ConfigService) { }

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { referenceId, referenceType, paymentMethod } = createInvoiceDto;

    let subtotal = 0;

    if (referenceType === 'order') {
      const { data: order, error } = await this.client
        .from('orders')
        .select('subtotal')
        .eq('id', referenceId)
        .single();

      handleSupabaseError(error, 'Order not found for invoice');
      if (!order) throw new NotFoundException('Order not found');
      subtotal = Number(order.subtotal);
    } else {
      // Session: aggregate subtotal of all orders in session
      const { data: orders, error } = await this.client
        .from('orders')
        .select('subtotal')
        .eq('session_id', referenceId);

      handleSupabaseError(error, 'Session not found or has no orders');
      subtotal = (orders ?? []).reduce((sum, o) => sum + Number(o.subtotal), 0);
    }

    if (subtotal === 0) {
      throw new BadRequestException('Cannot generate invoice for zero amount');
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const payload = toSnakeCase({
      referenceId,
      referenceType,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod || 'cash',
      status: 'paid',
    });

    const { data, error } = await this.client
      .from('invoices')
      .insert(payload)
      .select()
      .single();

    handleSupabaseError(error, 'Failed to create invoice');
    return toCamelCase(data);
  }

  async findAll(): Promise<any[]> {
    const { data: invoices, error } = await this.client
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'Failed to fetch invoices');
    if (!invoices) return [];

    // Enrichment: Fetch related orders, sessions, and tables
    const orderIds = invoices.filter(i => i.reference_type === 'order').map(i => i.reference_id);
    const sessionIds = invoices.filter(i => i.reference_type === 'session').map(i => i.reference_id);

    const [{ data: directOrders }, { data: sessions }, { data: sessionOrders }, { data: tables }] = await Promise.all([
      this.client.from('orders').select('id, order_type, table_id, session_id, order_items(*)').in('id', orderIds),
      this.client.from('sessions').select('id, table_id').in('id', sessionIds),
      this.client.from('orders').select('id, session_id, order_items(*)').in('session_id', sessionIds),
      this.client.from('tables').select('id, table_number'),
    ]);

    const orderMap = new Map((directOrders ?? []).map(o => [o.id, o]));
    const sessionMap = new Map((sessions ?? []).map(s => [s.id, s]));
    const tableMap = new Map((tables ?? []).map(t => [t.id, t.table_number]));
    const ordersBySession = new Map<string, any[]>();
    (sessionOrders ?? []).forEach(o => {
      const list = ordersBySession.get(o.session_id) || [];
      list.push(o);
      ordersBySession.set(o.session_id, list);
    });

    const mapOrderItem = (oi: any) => ({
      id: oi.id,
      menuItemId: oi.menu_item_id,
      menuItemName: oi.name,
      quantity: oi.quantity,
      unitPrice: Number(oi.price),
      lineTotal: Number(oi.price) * oi.quantity,
      size: oi.size
    });

    return invoices.map(inv => {
      let tableNumber: any = null;
      let orderType: string | null = null;
      let sessionId: string | null = null;
      let orderId: string | null = null;
      let items: any[] = [];

      if (inv.reference_type === 'order') {
        const order = orderMap.get(inv.reference_id);
        if (order) {
          orderType = order.order_type;
          sessionId = order.session_id;
          orderId = order.id;
          tableNumber = tableMap.get(order.table_id);
          items = (order.order_items || []).map(mapOrderItem);
        }
      } else if (inv.reference_type === 'session') {
        const session = sessionMap.get(inv.reference_id);
        orderType = 'table';
        sessionId = inv.reference_id;
        if (session) {
          tableNumber = tableMap.get(session.table_id);
        }
        
        // Aggregate items from all orders in session
        const sOrders = ordersBySession.get(inv.reference_id) || [];
        const itemMap = new Map();
        sOrders.forEach(so => {
          (so.order_items || []).forEach(oi => {
            const key = `${oi.menu_item_id}-${oi.size}`;
            const existing = itemMap.get(key);
            if (existing) {
              existing.quantity += oi.quantity;
              existing.lineTotal += Number(oi.price) * oi.quantity;
            } else {
              itemMap.set(key, mapOrderItem(oi));
            }
          });
        });
        items = Array.from(itemMap.values());
      }

      return {
        id: inv.id,
        tableNumber,
        sessionId,
        orderId,
        orderType,
        items,
        subtotal: Number(inv.subtotal),
        gst: Number(inv.tax),
        total: Number(inv.total),
        createdAt: inv.created_at,
      };
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const { data, error } = await this.client
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return toCamelCase(data);
  }
}