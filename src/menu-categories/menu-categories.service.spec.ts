import { Test, TestingModule } from '@nestjs/testing';
import { MenuCategoriesService } from './menu-categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { Repository } from 'typeorm';

describe('MenuCategoriesService', () => {
  let service: MenuCategoriesService;
  let repository: Repository<MenuCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuCategoriesService,
        {
          provide: getRepositoryToken(MenuCategory),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MenuCategoriesService>(MenuCategoriesService);
    repository = module.get<Repository<MenuCategory>>(getRepositoryToken(MenuCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
