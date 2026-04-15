import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';

const TAX_RATE = 0.05; // 5% GST

@Injectable()
export class InvoicesService {
  constructor(private readonly configService: ConfigService) {}

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

    const { data, error } = await this.client
      .from('invoices')
      .insert({
        reference_id: referenceId,
        reference_type: referenceType,
        subtotal,
        tax,
        total,
        payment_method: paymentMethod || 'cash',
        status: 'paid',
      })
      .select()
      .single();

    handleSupabaseError(error, 'Failed to create invoice');
    return this.mapInvoiceRow(data);
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

    return this.mapInvoiceRow(data);
  }

  private mapInvoiceRow(row: any): Invoice {
    if (!row) return row;
    return {
      id: row.id,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      subtotal: Number(row.subtotal),
      tax: Number(row.tax),
      discount: Number(row.discount ?? 0),
      total: Number(row.total),
      status: row.status,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
    };
  }
}