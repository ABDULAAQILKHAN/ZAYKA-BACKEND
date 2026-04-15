import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from './entities/address.entity';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

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
    return (data ?? []).map(row => toCamelCase(row));
  }

  async create(userId: string, value: string, makeDefault = false): Promise<Address> {
    const payload = toSnakeCase({ userId, value, isDefault: false });
    
    const { data, error } = await this.client
      .from('addresses')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create address');

    if (makeDefault && data?.id) {
      await this.setDefault(userId, data.id);
    }

    return toCamelCase(data);
  }

  async add(userId: string, value: string): Promise<Address> {
    const payload = toSnakeCase({ userId, value, isDefault: false });

    const { data, error } = await this.client
      .from('addresses')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to add address');
    return toCamelCase(data);
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

    return toCamelCase(data);
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

    return { message: 'Address deleted successfully' };
  }

  async setDefault(userId: string, addressId: string): Promise<{ message: string }> {
    // 1. Unset existing default
    const { error: unsetError } = await this.client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    
    handleSupabaseError(unsetError, 'Failed to unset current default address');

    // 2. Set new default
    const { data: address, error: setError } = await this.client
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('value')
      .single();
    
    handleSupabaseError(setError, 'Failed to set new default address');

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // 3. Update profile
    const { error: profileError } = await this.client
      .from('profiles')
      .update({ default_address: address.value })
      .eq('user_id', userId);
    
    handleSupabaseError(profileError, 'Failed to update profile default address');

    return { message: 'Default address updated' };
  }
}
