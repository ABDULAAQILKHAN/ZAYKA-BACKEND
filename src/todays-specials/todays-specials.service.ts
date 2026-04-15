import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TodaysSpecial } from './entities/todays-special.entity';
import { CreateTodaysSpecialDto } from './dto/create-todays-special.dto';
import { UpdateTodaysSpecialDto } from './dto/update-todays-special.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class TodaysSpecialsService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createTodaysSpecialDto: CreateTodaysSpecialDto): Promise<TodaysSpecial> {
    const payload = toSnakeCase(createTodaysSpecialDto);

    const { data, error } = await this.client
      .from('todays_specials')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create today\'s special');
    return toCamelCase(data);
  }

  async findAll(active?: boolean): Promise<TodaysSpecial[]> {
    let query = this.client.from('todays_specials').select('*').order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch today\'s specials');
    return (data ?? []).map(row => toCamelCase(row));
  }

  async findOne(id: string): Promise<TodaysSpecial> {
    const { data, error } = await this.client
      .from('todays_specials')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Today's special with ID ${id} not found`);
    }

    return toCamelCase(data);
  }

  async update(id: string, updateTodaysSpecialDto: UpdateTodaysSpecialDto): Promise<TodaysSpecial> {
    await this.findOne(id);

    const payload = toSnakeCase(updateTodaysSpecialDto);

    const { data, error } = await this.client
      .from('todays_specials')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to update today\'s special');
    return toCamelCase(data);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const { error } = await this.client.from('todays_specials').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete today\'s special');
  }
}
