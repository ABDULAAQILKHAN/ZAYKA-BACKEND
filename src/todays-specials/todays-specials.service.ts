import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodaysSpecial } from './entities/todays-special.entity';
import { CreateTodaysSpecialDto } from './dto/create-todays-special.dto';
import { UpdateTodaysSpecialDto } from './dto/update-todays-special.dto';

@Injectable()
export class TodaysSpecialsService {
  constructor(
    @InjectRepository(TodaysSpecial)
    private readonly todaysSpecialRepository: Repository<TodaysSpecial>,
  ) {}

  async create(createTodaysSpecialDto: CreateTodaysSpecialDto): Promise<TodaysSpecial> {
    const todaysSpecial = this.todaysSpecialRepository.create(createTodaysSpecialDto);
    return await this.todaysSpecialRepository.save(todaysSpecial);
  }

  async findAll(active?: boolean): Promise<TodaysSpecial[]> {
    const queryBuilder = this.todaysSpecialRepository.createQueryBuilder('todaysSpecial');
    
    if (active !== undefined) {
      queryBuilder.where('todaysSpecial.isActive = :active', { active });
    }
    
    return await queryBuilder
      .orderBy('todaysSpecial.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<TodaysSpecial> {
    const todaysSpecial = await this.todaysSpecialRepository.findOne({ 
      where: { id } 
    });

    if (!todaysSpecial) {
      throw new NotFoundException(`Today's special with ID ${id} not found`);
    }

    return todaysSpecial;
  }

  async update(id: string, updateTodaysSpecialDto: UpdateTodaysSpecialDto): Promise<TodaysSpecial> {
    const todaysSpecial = await this.findOne(id);
    
    Object.assign(todaysSpecial, updateTodaysSpecialDto);
    
    return await this.todaysSpecialRepository.save(todaysSpecial);
  }

  async remove(id: string): Promise<void> {
    const todaysSpecial = await this.findOne(id);
    await this.todaysSpecialRepository.remove(todaysSpecial);
  }
}
