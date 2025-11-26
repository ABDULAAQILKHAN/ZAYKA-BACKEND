import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@Injectable()
export class MenuCategoriesService {
  constructor(
    @InjectRepository(MenuCategory)
    private menuCategoryRepository: Repository<MenuCategory>,
  ) {}

  async create(createMenuCategoryDto: CreateMenuCategoryDto): Promise<MenuCategory> {
    // Check if category with same name already exists
    const existing = await this.menuCategoryRepository.findOne({
      where: { name: createMenuCategoryDto.name }
    });

    if (existing) {
      throw new ConflictException(`Category with name "${createMenuCategoryDto.name}" already exists`);
    }

    const category = this.menuCategoryRepository.create(createMenuCategoryDto);
    return await this.menuCategoryRepository.save(category);
  }

  async findAll(activeOnly?: boolean): Promise<MenuCategory[]> {
    const queryBuilder = this.menuCategoryRepository
      .createQueryBuilder('category')
      .orderBy('category.sort_order', 'ASC')
      .addOrderBy('category.name', 'ASC');

    if (activeOnly) {
      queryBuilder.where('category.is_active = :isActive', { isActive: true });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<MenuCategory> {
    const category = await this.menuCategoryRepository.findOne({
      where: { id }
    });

    if (!category) {
      throw new NotFoundException(`Menu category with ID "${id}" not found`);
    }

    return category;
  }

  async update(id: string, updateMenuCategoryDto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    const category = await this.findOne(id);

    // Check if updating name to an existing category name
    if (updateMenuCategoryDto.name && updateMenuCategoryDto.name !== category.name) {
      const existing = await this.menuCategoryRepository.findOne({
        where: { name: updateMenuCategoryDto.name }
      });

      if (existing) {
        throw new ConflictException(`Category with name "${updateMenuCategoryDto.name}" already exists`);
      }
    }

    Object.assign(category, updateMenuCategoryDto);
    return await this.menuCategoryRepository.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.menuCategoryRepository.remove(category);
    return { message: `Category "${category.name}" deleted successfully` };
  }
}
