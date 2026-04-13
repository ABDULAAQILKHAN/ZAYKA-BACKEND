import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapProfileRow } from '../lib/supabase-mappers';

@Injectable()
export class ProfileService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async findAll() {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'Failed to fetch profiles');
    return (data ?? []).map(mapProfileRow);
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    const profile = mapProfileRow(data);
    (profile as any).totalCertificates = 0;
    (profile as any).totalPublicCertificates = 0;
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const { id: _, sub: __, email: ___, ...updateData } = updateProfileDto as any;

    const payload: Record<string, unknown> = {};
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.phone !== undefined) payload.phone = updateData.phone;
    if (updateData.avatar !== undefined) payload.avatar = updateData.avatar;
    if (updateData.defaultAddress !== undefined) payload.default_address = updateData.defaultAddress;
    if (updateData.isDark !== undefined) payload.is_dark = updateData.isDark;

    const { data, error } = await this.client
      .from('profiles')
      .update(payload)
      .eq('user_id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return mapProfileRow(data);
  }

  async updateTheme(id: string) {
    const profile = await this.findOne(id);

    const { data, error } = await this.client
      .from('profiles')
      .update({ is_dark: !profile.isDark })
      .eq('user_id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return mapProfileRow(data);
  }

  async getTheme(id: string) {
    const profile = await this.findOne(id);
    return profile.isDark ?? false;
  }

  async remove(id: string) {
    const { error } = await this.client.from('profiles').delete().eq('user_id', id);
    handleSupabaseError(error, 'Failed to delete profile');
    return { message: `Profile with ID ${id} deleted successfully` };
  }
}
