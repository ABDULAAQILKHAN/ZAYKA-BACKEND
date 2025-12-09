import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async list(userId: string): Promise<Address[]> {
    return await this.addressRepository.find({ where: { userId }, order: { isDefault: 'DESC', updatedAt: 'DESC' } });
  }

  async create(userId: string, value: string, makeDefault = false): Promise<Address> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException(`Profile ${userId} not found`);
    const addr = this.addressRepository.create({ userId, value, isDefault: false });
    const saved = await this.addressRepository.save(addr);
    // Requirement: creating address sets default
    await this.setDefault(userId, saved.id);
    return saved;
  }

  async add(userId: string, value: string): Promise<Address> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException(`Profile ${userId} not found`);
    const addr = this.addressRepository.create({ userId, value, isDefault: false });
    return await this.addressRepository.save(addr);
  }

  async update(userId: string, addressId: string, value: string): Promise<Address> {
    const addr = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    addr.value = value;
    return await this.addressRepository.save(addr);
  }

  async remove(userId: string): Promise<{ message: string }> {
    await this.addressRepository.delete({ userId });
    await this.profileRepository.update({ userId }, { defaultAddress: null });
    return { message: 'All addresses removed and default cleared' };
  }

  async delete(userId: string, addressId: string): Promise<{ message: string }> {
    const addr = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    await this.addressRepository.delete({ id: addressId });
    if (addr.isDefault) {
      await this.profileRepository.update({ userId }, { defaultAddress: null });
    }
    return { message: 'Address deleted' };
  }

  async deleteByIndex(userId: string, index: number): Promise<{ message: string }> {
    const list = await this.list(userId);
    if (index < 0 || index >= list.length) throw new NotFoundException('Address index out of range');
    const target = list[index];
    return await this.delete(userId, target.id);
  }

  async setDefault(userId: string, addressId: string): Promise<{ message: string }> {
    const addr = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    // Clear other defaults
    await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    // Set default on this address
    addr.isDefault = true;
    await this.addressRepository.save(addr);
    // Reflect on profile
    await this.profileRepository.update({ userId }, { defaultAddress: addr.value });
    return { message: 'Default address updated' };
  }

  async setDefaultByIndex(userId: string, index: number): Promise<{ message: string }> {
    const list = await this.list(userId);
    if (index < 0 || index >= list.length) throw new NotFoundException('Address index out of range');
    const target = list[index];
    return await this.setDefault(userId, target.id);
  }
}
