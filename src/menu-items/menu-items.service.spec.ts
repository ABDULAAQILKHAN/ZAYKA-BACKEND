import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsService } from './menu-items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Repository } from 'typeorm';

describe('MenuItemsService', () => {
  let service: MenuItemsService;
  let repository: Repository<MenuItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        {
          provide: getRepositoryToken(MenuItem),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
    repository = module.get<Repository<MenuItem>>(getRepositoryToken(MenuItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
