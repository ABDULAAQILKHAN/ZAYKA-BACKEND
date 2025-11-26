import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const item = this.menuItemRepository.create(createMenuItemDto);
    return await this.menuItemRepository.save(item);
  }

  async findAll(
    categoryId?: string,
    available?: boolean,
    search?: string
  ): Promise<MenuItem[]> {
    const queryBuilder = this.menuItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.categoryRelation', 'category')
      .orderBy('item.name', 'ASC');

    // Filter by category ID
    if (categoryId) {
      queryBuilder.andWhere('item.category_id = :categoryId', { categoryId });
    }

    // Filter by availability
    if (available !== undefined) {
      queryBuilder.andWhere('item.is_available = :available', { available });
    }

    // Search by name or description
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(item.name) LIKE LOWER(:search) OR LOWER(item.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const items = await queryBuilder.getMany();
    
    // Map the response to include category name
    return items.map(item => ({
      ...item,
      category: item.categoryRelation?.name || null,
      categoryRelation: undefined
    })) as any;
  }

  async findOne(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['categoryRelation']
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    // Map the response to include category name
    return {
      ...item,
      category: item.categoryRelation?.name || null,
      categoryRelation: undefined
    } as any;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOne(id);
    Object.assign(item, updateMenuItemDto);
    return await this.menuItemRepository.save(item);
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const item = await this.findOne(id);
    item.isAvailable = !item.isAvailable;
    return await this.menuItemRepository.save(item);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.menuItemRepository.remove(item);
    return { message: `Menu item "${item.name}" deleted successfully` };
  }
}
