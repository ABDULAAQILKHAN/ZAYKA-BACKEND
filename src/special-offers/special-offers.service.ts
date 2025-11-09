import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialOffer } from './entities/special-offer.entity';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';
import { UpdateSpecialOfferDto } from './dto/update-special-offer.dto';

@Injectable()
export class SpecialOffersService {
  constructor(
    @InjectRepository(SpecialOffer)
    private readonly specialOfferRepository: Repository<SpecialOffer>,
  ) {}

  async create(createSpecialOfferDto: CreateSpecialOfferDto): Promise<SpecialOffer> {
    const specialOffer = this.specialOfferRepository.create(createSpecialOfferDto);
    return await this.specialOfferRepository.save(specialOffer);
  }

  async findAll(active?: boolean): Promise<SpecialOffer[]> {
    const queryBuilder = this.specialOfferRepository.createQueryBuilder('specialOffer');
    
    if (active !== undefined) {
      queryBuilder.where('specialOffer.isActive = :active', { active });
    }
    
    return await queryBuilder
      .orderBy('specialOffer.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<SpecialOffer> {
    const specialOffer = await this.specialOfferRepository.findOne({ 
      where: { id } 
    });

    if (!specialOffer) {
      throw new NotFoundException(`Special offer with ID ${id} not found`);
    }

    return specialOffer;
  }

  async update(id: string, updateSpecialOfferDto: UpdateSpecialOfferDto): Promise<SpecialOffer> {
    const specialOffer = await this.findOne(id);
    
    Object.assign(specialOffer, updateSpecialOfferDto);
    
    return await this.specialOfferRepository.save(specialOffer);
  }

  async remove(id: string): Promise<void> {
    const specialOffer = await this.findOne(id);
    await this.specialOfferRepository.remove(specialOffer);
  }
}
