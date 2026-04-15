import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class MenuItemsService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const payload = toSnakeCase(createMenuItemDto);

    const { data, error } = await this.client
      .from('menu_items')
      .insert(payload)
      .select('*, menu_categories(id, name)')
      .single();

    handleSupabaseError(error, 'Failed to create menu item');
    return toCamelCase(data);
  }

  async findAll(categoryId?: string, available?: boolean, search?: string): Promise<MenuItem[]> {
    let query = this.client
      .from('menu_items')
      .select('*, menu_categories(id, name)')
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (available !== undefined) {
      query = query.eq('is_available', available);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    handleSupabaseError(error, 'Failed to fetch menu items');
    return (data ?? []).map(row => toCamelCase(row));
  }

  async findOne(id: string): Promise<MenuItem> {
    const { data, error } = await this.client
      .from('menu_items')
      .select('*, menu_categories(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return toCamelCase(data);
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    await this.findOne(id);

    const payload = toSnakeCase(updateMenuItemDto);

    const { data, error } = await this.client
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select('*, menu_categories(id, name)')
      .single();

    handleSupabaseError(error, 'Failed to update menu item');
    return toCamelCase(data);
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const item = await this.findOne(id);

    const { data, error } = await this.client
      .from('menu_items')
      .update({ is_available: !item.isAvailable })
      .eq('id', id)
      .select('*, menu_categories(id, name)')
      .single();

    handleSupabaseError(error, 'Failed to update menu item');
    return toCamelCase(data);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    const { error } = await this.client.from('menu_items').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete menu item');
    return { message: `Menu item "${item.name}" deleted successfully` };
  }
}
