import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TodaysSpecial } from './entities/todays-special.entity';
import { CreateTodaysSpecialDto } from './dto/create-todays-special.dto';
import { UpdateTodaysSpecialDto } from './dto/update-todays-special.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapTodaysSpecialRow } from '../lib/supabase-mappers';

@Injectable()
export class TodaysSpecialsService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createTodaysSpecialDto: CreateTodaysSpecialDto): Promise<TodaysSpecial> {
    const payload = {
      name: createTodaysSpecialDto.name,
      description: createTodaysSpecialDto.description,
      price: createTodaysSpecialDto.price,
      image: createTodaysSpecialDto.image,
      category: createTodaysSpecialDto.category,
      is_veg: createTodaysSpecialDto.isVeg ?? false,
      is_active: createTodaysSpecialDto.isActive ?? true,
    };

    const { data, error } = await this.client
      .from('todays_specials')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create today\'s special');
    return mapTodaysSpecialRow(data) as TodaysSpecial;
  }

  async findAll(active?: boolean): Promise<TodaysSpecial[]> {
    let query = this.client.from('todays_specials').select('*').order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch today\'s specials');
    return (data ?? []).map(mapTodaysSpecialRow) as TodaysSpecial[];
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

    return mapTodaysSpecialRow(data) as TodaysSpecial;
  }

  async update(id: string, updateTodaysSpecialDto: UpdateTodaysSpecialDto): Promise<TodaysSpecial> {
    await this.findOne(id);

    const payload: Record<string, unknown> = {};
    if (updateTodaysSpecialDto.name !== undefined) payload.name = updateTodaysSpecialDto.name;
    if (updateTodaysSpecialDto.description !== undefined) payload.description = updateTodaysSpecialDto.description;
    if (updateTodaysSpecialDto.price !== undefined) payload.price = updateTodaysSpecialDto.price;
    if (updateTodaysSpecialDto.image !== undefined) payload.image = updateTodaysSpecialDto.image;
    if (updateTodaysSpecialDto.category !== undefined) payload.category = updateTodaysSpecialDto.category;
    if (updateTodaysSpecialDto.isVeg !== undefined) payload.is_veg = updateTodaysSpecialDto.isVeg;
    if (updateTodaysSpecialDto.isActive !== undefined) payload.is_active = updateTodaysSpecialDto.isActive;

    const { data, error } = await this.client
      .from('todays_specials')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Today's special with ID ${id} not found`);
    }

    return mapTodaysSpecialRow(data) as TodaysSpecial;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const { error } = await this.client.from('todays_specials').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete today\'s special');
  }
}
