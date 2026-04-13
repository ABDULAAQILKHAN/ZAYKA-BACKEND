import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from './entities/address.entity';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapAddressRow } from '../lib/supabase-mappers';

@Injectable()
export class AddressService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async list(userId: string): Promise<Address[]> {
    const { data, error } = await this.client
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false });

    handleSupabaseError(error, 'Failed to fetch addresses');
    return (data ?? []).map(mapAddressRow) as Address[];
  }

  async create(userId: string, value: string, makeDefault = false): Promise<Address> {
    const { data, error } = await this.client
      .from('addresses')
      .insert({ user_id: userId, value, is_default: false })
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create address');

    if (makeDefault && data?.id) {
      await this.setDefault(userId, data.id);
    }

    return mapAddressRow(data) as Address;
  }

  async add(userId: string, value: string): Promise<Address> {
    const { data, error } = await this.client
      .from('addresses')
      .insert({ user_id: userId, value, is_default: false })
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to add address');
    return mapAddressRow(data) as Address;
  }

  async update(userId: string, addressId: string, value: string): Promise<Address> {
    const { data, error } = await this.client
      .from('addresses')
      .update({ value })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException('Address not found');
    }

    return mapAddressRow(data) as Address;
  }

  async remove(userId: string): Promise<{ message: string }> {
    const { error: addressesError } = await this.client.from('addresses').delete().eq('user_id', userId);
    handleSupabaseError(addressesError, 'Failed to delete addresses');

    const { error: profileError } = await this.client
      .from('profiles')
      .update({ default_address: null })
      .eq('user_id', userId);

    handleSupabaseError(profileError, 'Failed to clear profile default address');

    return { message: 'All addresses removed and default cleared' };
  }

  async delete(userId: string, addressId: string): Promise<{ message: string }> {
    const { data: address, error: findError } = await this.client
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();

    if (findError || !address) {
      throw new NotFoundException('Address not found');
    }

    const { error: deleteError } = await this.client.from('addresses').delete().eq('id', addressId);
    handleSupabaseError(deleteError, 'Failed to delete address');

    if (address.is_default) {
      const { error: profileError } = await this.client
        .from('profiles')
        .update({ default_address: null })
        .eq('user_id', userId);
      handleSupabaseError(profileError, 'Failed to clear profile default address');
    }

    return { message: 'Address deleted' };
  }

  async deleteByIndex(userId: string, index: number): Promise<{ message: string }> {
    const list = await this.list(userId);
    if (index < 0 || index >= list.length) {
      throw new NotFoundException('Address index out of range');
    }

    const target = list[index];
    return this.delete(userId, target.id);
  }

  async setDefault(userId: string, addressId: string): Promise<{ message: string }> {
    const { data: address, error: findError } = await this.client
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();

    if (findError || !address) {
      throw new NotFoundException('Address not found');
    }

    const { error: clearError } = await this.client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);

    handleSupabaseError(clearError, 'Failed to clear existing default address');

    const { error: setError } = await this.client
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);

    handleSupabaseError(setError, 'Failed to set default address');

    const { error: profileError } = await this.client
      .from('profiles')
      .update({ default_address: address.value })
      .eq('user_id', userId);

    handleSupabaseError(profileError, 'Failed to sync default address to profile');

    return { message: 'Default address updated' };
  }

  async setDefaultByIndex(userId: string, index: number): Promise<{ message: string }> {
    const list = await this.list(userId);
    if (index < 0 || index >= list.length) {
      throw new NotFoundException('Address index out of range');
    }

    const target = list[index];
    return this.setDefault(userId, target.id);
  }
}
