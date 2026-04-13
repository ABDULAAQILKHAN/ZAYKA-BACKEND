import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapMenuItemRow } from '../lib/supabase-mappers';

@Injectable()
export class MenuItemsService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const payload = {
      name: createMenuItemDto.name,
      description: createMenuItemDto.description,
      full_price: createMenuItemDto.fullPrice,
      half_price: createMenuItemDto.halfPrice ?? null,
      image: createMenuItemDto.image ?? null,
      category_id: createMenuItemDto.categoryId ?? null,
      is_veg: createMenuItemDto.isVeg ?? false,
      is_spicy: createMenuItemDto.isSpicy ?? false,
      is_available: createMenuItemDto.isAvailable ?? true,
      ingredients: createMenuItemDto.ingredients ?? null,
      allergens: createMenuItemDto.allergens ?? null,
      nutritional_info: createMenuItemDto.nutritionalInfo ?? null,
      preparation_time: createMenuItemDto.preparationTime ?? null,
    };

    const { data, error } = await this.client
      .from('menu_items')
      .insert(payload)
      .select('*, menu_categories(id, name)')
      .single();

    handleSupabaseError(error, 'Failed to create menu item');
    return mapMenuItemRow(data) as MenuItem;
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
    return (data ?? []).map(mapMenuItemRow) as MenuItem[];
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

    return mapMenuItemRow(data) as MenuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    await this.findOne(id);

    const payload: Record<string, unknown> = {};
    if (updateMenuItemDto.name !== undefined) payload.name = updateMenuItemDto.name;
    if (updateMenuItemDto.description !== undefined) payload.description = updateMenuItemDto.description;
    if (updateMenuItemDto.fullPrice !== undefined) payload.full_price = updateMenuItemDto.fullPrice;
    if (updateMenuItemDto.halfPrice !== undefined) payload.half_price = updateMenuItemDto.halfPrice;
    if (updateMenuItemDto.image !== undefined) payload.image = updateMenuItemDto.image;
    if (updateMenuItemDto.categoryId !== undefined) payload.category_id = updateMenuItemDto.categoryId;
    if (updateMenuItemDto.isVeg !== undefined) payload.is_veg = updateMenuItemDto.isVeg;
    if (updateMenuItemDto.isSpicy !== undefined) payload.is_spicy = updateMenuItemDto.isSpicy;
    if (updateMenuItemDto.isAvailable !== undefined) payload.is_available = updateMenuItemDto.isAvailable;
    if (updateMenuItemDto.ingredients !== undefined) payload.ingredients = updateMenuItemDto.ingredients;
    if (updateMenuItemDto.allergens !== undefined) payload.allergens = updateMenuItemDto.allergens;
    if (updateMenuItemDto.nutritionalInfo !== undefined) payload.nutritional_info = updateMenuItemDto.nutritionalInfo;
    if (updateMenuItemDto.preparationTime !== undefined) payload.preparation_time = updateMenuItemDto.preparationTime;

    const { data, error } = await this.client
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select('*, menu_categories(id, name)')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return mapMenuItemRow(data) as MenuItem;
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const item = await this.findOne(id);

    const { data, error } = await this.client
      .from('menu_items')
      .update({ is_available: !item.isAvailable })
      .eq('id', id)
      .select('*, menu_categories(id, name)')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return mapMenuItemRow(data) as MenuItem;
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    const { error } = await this.client.from('menu_items').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete menu item');
    return { message: `Menu item "${item.name}" deleted successfully` };
  }
}
