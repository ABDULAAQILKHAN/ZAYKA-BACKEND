import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpecialOffer } from './entities/special-offer.entity';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';
import { UpdateSpecialOfferDto } from './dto/update-special-offer.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class SpecialOffersService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createSpecialOfferDto: CreateSpecialOfferDto): Promise<SpecialOffer> {
    const payload = toSnakeCase(createSpecialOfferDto);

    const { data, error } = await this.client
      .from('special_offers')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create special offer');
    return toCamelCase(data);
  }

  async findAll(active?: boolean): Promise<SpecialOffer[]> {
    let query = this.client.from('special_offers').select('*').order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch special offers');
    return (data ?? []).map(row => toCamelCase(row));
  }

  async findOne(id: string): Promise<SpecialOffer> {
    const { data, error } = await this.client
      .from('special_offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Special offer with ID ${id} not found`);
    }

    return toCamelCase(data);
  }

  async update(id: string, updateSpecialOfferDto: UpdateSpecialOfferDto): Promise<SpecialOffer> {
    await this.findOne(id);

    const payload = toSnakeCase(updateSpecialOfferDto);

    const { data, error } = await this.client
      .from('special_offers')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to update special offer');
    return toCamelCase(data);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const { error } = await this.client.from('special_offers').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete special offer');
  }
}
