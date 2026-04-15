import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

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

    const payload = toSnakeCase(createMenuCategoryDto);

    const { data, error } = await this.client
      .from('menu_categories')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create category');
    return toCamelCase(data);
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
    return (data ?? []).map(row => toCamelCase(row));
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

    return toCamelCase(data);
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

    const payload = toSnakeCase(updateMenuCategoryDto);

    const { data, error } = await this.client
      .from('menu_categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to update category');
    return toCamelCase(data);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    const { error } = await this.client.from('menu_categories').delete().eq('id', id);
    handleSupabaseError(error, 'Failed to delete category');
    return { message: `Category "${category.name}" deleted successfully` };
  }
}
