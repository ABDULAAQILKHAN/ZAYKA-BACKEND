import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapMenuCategoryRow } from '../lib/supabase-mappers';

@Injectable()
export class MenuCategoriesService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async create(createMenuCategoryDto: CreateMenuCategoryDto): Promise<MenuCategory> {
    const { data: existing } = await this.client
      .from('menu_categories')
      .select('id')
      .eq('name', createMenuCategoryDto.name)
      .maybeSingle();

    if (existing) {
      throw new ConflictException(`Category with name "${createMenuCategoryDto.name}" already exists`);
    }

    const payload = {
      name: createMenuCategoryDto.name,
      description: createMenuCategoryDto.description ?? null,
      image: createMenuCategoryDto.image ?? null,
      is_active: createMenuCategoryDto.isActive ?? true,
      sort_order: createMenuCategoryDto.sortOrder ?? 0,
    };

    const { data, error } = await this.client
      .from('menu_categories')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create category');
    return mapMenuCategoryRow(data) as MenuCategory;
  }

  async findAll(activeOnly?: boolean): Promise<MenuCategory[]> {
    let query = this.client
      .from('menu_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'Failed to fetch categories');
    return (data ?? []).map(mapMenuCategoryRow) as MenuCategory[];
  }

  async findOne(id: string): Promise<MenuCategory> {
    const { data, error } = await this.client
      .from('menu_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Menu category with ID "${id}" not found`);
    }

    return mapMenuCategoryRow(data) as MenuCategory;
  }

  async update(id: string, updateMenuCategoryDto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    const current = await this.findOne(id);

    if (updateMenuCategoryDto.name && updateMenuCategoryDto.name !== current.name) {
      const { data: existing } = await this.client
        .from('menu_categories')
        .select('id')
        .eq('name', updateMenuCategoryDto.name)
        .maybeSingle();

      if (existing) {
        throw new ConflictException(`Category with name "${updateMenuCategoryDto.name}" already exists`);
      }
    }

    const payload: Record<string, unknown> = {};
    if (updateMenuCategoryDto.name !== undefined) payload.name = updateMenuCategoryDto.name;
    if (updateMenuCategoryDto.description !== undefined) payload.description = updateMenuCategoryDto.description;
    if (updateMenuCategoryDto.image !== undefined) payload.image = updateMenuCategoryDto.image;
    if (updateMenuCategoryDto.isActive !== undefined) payload.is_active = updateMenuCategoryDto.isActive;
    if (updateMenuCategoryDto.sortOrder !== undefined) payload.sort_order = updateMenuCategoryDto.sortOrder;

    const { data, error } = await this.client
      .from('menu_categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Menu category with ID "${id}" not found`);
    }

    return mapMenuCategoryRow(data) as MenuCategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    const { error } = await this.client.from('menu_categories').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete category');
    return { message: `Category "${category.name}" deleted successfully` };
  }
}
