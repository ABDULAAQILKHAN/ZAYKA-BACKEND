import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session, SessionStatus } from './entities/session.entity';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { TablesService } from '../tables/tables.service';
import { TableStatus } from '../tables/entities/table.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class SessionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tablesService: TablesService,
    private readonly invoicesService: InvoicesService,
  ) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async findAll(status?: SessionStatus): Promise<Session[]> {
    let query = this.client.from('sessions').select('*').order('opened_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch sessions');

    return (data ?? []).map(row => toCamelCase(row));
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*, tables(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const session = toCamelCase(data);
    if (data.tables) {
      session.table = toCamelCase(data.tables);
    }

    // Fetch orders for this session
    const { data: orders, error: ordersError } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .eq('session_id', id);
    
    handleSupabaseError(ordersError, 'Failed to fetch session orders');
    session.orders = (orders ?? []).map(row => toCamelCase(row));

    return session;
  }

  async closeSession(id: string): Promise<Session> {
    const session = await this.findOne(id);
    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed');
    }

    // 1. Mark session as closed
    const payload = toSnakeCase({
      status: SessionStatus.CLOSED,
      closedAt: new Date().toISOString(),
    });

    const { data: updatedSession, error: sessionError } = await this.client
      .from('sessions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    handleSupabaseError(sessionError, 'Failed to close session');

    // 2. Mark table as available
    await this.tablesService.update(session.tableId, { status: TableStatus.AVAILABLE });

    // 3. Mark orders as delivered
    const { error: ordersUpdateError } = await this.client
        .from('orders')
        .update({ status: 'delivered' })
        .eq('session_id', id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served']);
    
    handleSupabaseError(ordersUpdateError, 'Failed to update session orders status');

    // 4. Generate invoice
    await this.invoicesService.create({
      referenceId: id,
      referenceType: 'session',
      paymentMethod: 'cash', // Default
    });

    return toCamelCase(updatedSession);
  }

  async findOrCreateActiveSession(tableId: string): Promise<Session> {
    const { data: existing, error } = await this.client
      .from('sessions')
      .select('*')
      .eq('table_id', tableId)
      .eq('status', SessionStatus.OPEN)
      .maybeSingle();

    if (existing) {
      return toCamelCase(existing);
    }

    const payload = toSnakeCase({
      tableId,
      status: SessionStatus.OPEN,
    });

    const { data, error: insertError } = await this.client
      .from('sessions')
      .insert(payload)
      .select()
      .single();

    handleSupabaseError(insertError, 'Failed to create session');
    
    // Update table status to occupied
    await this.tablesService.update(tableId, { status: TableStatus.OCCUPIED });

    return toCamelCase(data);
  }
}