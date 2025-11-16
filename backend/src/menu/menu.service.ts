import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(createMenuItemDto: any, tenantId: string): Promise<MenuItem> {
    const menuItem = new this.menuItemModel({ ...createMenuItemDto, tenantId });
    return menuItem.save();
  }

  async findAll(tenantId: string): Promise<MenuItem[]> {
    return this.menuItemModel.find({ tenantId }).exec();
  }

  async findByCategory(category: string, tenantId: string): Promise<MenuItem[]> {
    return this.menuItemModel.find({ category, isAvailable: true, tenantId }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<MenuItem> {
    const menuItem = await this.menuItemModel.findOne({ _id: id, tenantId }).exec();
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async update(id: string, updateMenuItemDto: any, tenantId: string): Promise<MenuItem> {
    const menuItem = await this.menuItemModel
      .findOneAndUpdate({ _id: id, tenantId }, updateMenuItemDto, { new: true })
      .exec();
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.menuItemModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException('Menu item not found');
    }
  }
}
