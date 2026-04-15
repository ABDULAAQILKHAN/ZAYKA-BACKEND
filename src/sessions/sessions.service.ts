import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session, SessionStatus } from './entities/session.entity';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapOrderRow } from '../lib/supabase-mappers';
import { TablesService } from '../tables/tables.service';
import { TableStatus } from '../tables/entities/table.entity';
import { InvoicesService } from '../invoices/invoices.service';

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

    return (data ?? []).map(row => this.mapSessionRow(row));
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

    const session = this.mapSessionRow(data);
    (session as any).table = data.tables;

    // Fetch orders for this session
    const { data: orders, error: ordersError } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .eq('session_id', id);
    
    handleSupabaseError(ordersError, 'Failed to fetch session orders');
    (session as any).orders = (orders ?? []).map(mapOrderRow);

    return session;
  }

  async closeSession(id: string): Promise<Session> {
    const session = await this.findOne(id);
    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed');
    }

    // 1. Mark session as closed
    const { data: updatedSession, error: sessionError } = await this.client
      .from('sessions')
      .update({
        status: SessionStatus.CLOSED,
        closed_at: new Date().toISOString(),
      })
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

    return this.mapSessionRow(updatedSession);
  }

  async findOrCreateActiveSession(tableId: string): Promise<Session> {
    const { data: existing, error } = await this.client
      .from('sessions')
      .select('*')
      .eq('table_id', tableId)
      .eq('status', SessionStatus.OPEN)
      .maybeSingle();

    if (existing) {
      return this.mapSessionRow(existing);
    }

    const { data, error: insertError } = await this.client
      .from('sessions')
      .insert({
        table_id: tableId,
        status: SessionStatus.OPEN,
      })
      .select()
      .single();

    handleSupabaseError(insertError, 'Failed to create session');
    
    // Update table status to occupied
    await this.tablesService.update(tableId, { status: TableStatus.OCCUPIED });

    return this.mapSessionRow(data);
  }

  private mapSessionRow(row: any): Session {
    if (!row) return row;
    return {
      id: row.id,
      tableId: row.table_id,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}