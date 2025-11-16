import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModifierGroup, ModifierGroupDocument } from './schemas/modifier-group.schema';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';
import { UpdateModifierGroupDto } from './dto/update-modifier-group.dto';

@Injectable()
export class ModifiersService {
  constructor(
    @InjectModel(ModifierGroup.name) private modifierGroupModel: Model<ModifierGroupDocument>,
  ) {}

  async create(
    tenantId: string,
    createDto: CreateModifierGroupDto,
  ): Promise<ModifierGroup> {
    const modifierGroup = new this.modifierGroupModel({
      ...createDto,
      tenantId,
    });
    return modifierGroup.save();
  }

  async findAll(tenantId: string): Promise<ModifierGroup[]> {
    return this.modifierGroupModel
      .find({ tenantId, isActive: true })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findByCategory(
    tenantId: string,
    category: string,
  ): Promise<ModifierGroup[]> {
    return this.modifierGroupModel
      .find({
        tenantId,
        isActive: true,
        applicableCategories: category,
      })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<ModifierGroup> {
    const group = await this.modifierGroupModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!group) {
      throw new NotFoundException('Modifier group not found');
    }
    return group;
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateModifierGroupDto,
  ): Promise<ModifierGroup> {
    const group = await this.modifierGroupModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!group) {
      throw new NotFoundException('Modifier group not found');
    }
    return group;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.modifierGroupModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();
    if (!result) {
      throw new NotFoundException('Modifier group not found');
    }
  }
}
