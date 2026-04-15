import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Table, TableStatus } from './entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

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

    const payload = toSnakeCase({
      ...createTableDto,
      status: TableStatus.AVAILABLE,
    });

    const { data, error } = await this.client
      .from('tables')
      .insert(payload)
      .select()
      .single();

    handleSupabaseError(error, 'Failed to create table');
    return toCamelCase(data);
  }

  async findAll(status?: TableStatus): Promise<Table[]> {
    let query = this.client.from('tables').select('*').order('table_number', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch tables');

    const tables = (data ?? []).map((row) => toCamelCase(row));

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

    const table = toCamelCase(data);

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

    const payload = toSnakeCase(updateTableDto);

    const { data, error } = await this.client
      .from('tables')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    handleSupabaseError(error, 'Failed to update table');
    return toCamelCase(data);
  }

  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    
    if (table.status !== TableStatus.AVAILABLE || (table as any).activeOrderCount > 0) {
      throw new BadRequestException('Cannot delete an active table. Please ensure the table is available and has no active orders.');
    }

    const { error } = await this.client.from('tables').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete table');
  }
}