import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Table, TableStatus } from './entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';

@Injectable()
export class TablesService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const { data: existing } = await this.client
      .from('tables')
      .select('id')
      .eq('table_number', createTableDto.tableNumber)
      .single();

    if (existing) {
      throw new BadRequestException(`Table with number ${createTableDto.tableNumber} already exists`);
    }

    const { data, error } = await this.client
      .from('tables')
      .insert({
        table_number: createTableDto.tableNumber,
        seats: createTableDto.seats ?? 4,
        location: createTableDto.location ?? null,
        status: TableStatus.AVAILABLE,
      })
      .select()
      .single();

    handleSupabaseError(error, 'Failed to create table');
    return this.mapTableRow(data);
  }

  async findAll(status?: TableStatus): Promise<Table[]> {
    let query = this.client.from('tables').select('*').order('table_number', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch tables');

    const tables = (data ?? []).map((row) => this.mapTableRow(row));

    for (const table of tables) {
      const { count } = await this.client
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('table_id', table.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'out_for_delivery']);

      (table as any).activeOrderCount = count ?? 0;
    }

    return tables;
  }

  async findOne(id: string): Promise<Table> {
    const { data, error } = await this.client
      .from('tables')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    const table = this.mapTableRow(data);

    const { count } = await this.client
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('table_id', id)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'out_for_delivery']);

    (table as any).activeOrderCount = count ?? 0;

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    await this.findOne(id);

    const payload: Record<string, unknown> = {};
    if (updateTableDto.seats !== undefined) payload.seats = updateTableDto.seats;
    if (updateTableDto.status !== undefined) payload.status = updateTableDto.status;
    if (updateTableDto.location !== undefined) payload.location = updateTableDto.location;

    const { data, error } = await this.client
      .from('tables')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    handleSupabaseError(error, 'Failed to update table');
    return this.mapTableRow(data);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const { error } = await this.client.from('tables').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete table');
  }

  private mapTableRow(row: any): Table {
    if (!row) return row;
    return {
      id: row.id,
      tableNumber: row.table_number,
      seats: row.seats,
      status: row.status,
      location: row.location,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}