import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './schemas/inventory-item.schema';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItemDocument>,
  ) {}

  async create(
    tenantId: string,
    createDto: CreateInventoryItemDto,
  ): Promise<InventoryItem> {
    // Check if SKU already exists for this tenant
    const existing = await this.inventoryModel
      .findOne({ tenantId, sku: createDto.sku })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Item with SKU ${createDto.sku} already exists`,
      );
    }

    const item = new this.inventoryModel({
      ...createDto,
      tenantId,
      isActive: true,
    });
    return item.save();
  }

  async findAll(tenantId: string): Promise<InventoryItem[]> {
    return this.inventoryModel
      .find({ tenantId, isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findLowStock(tenantId: string): Promise<InventoryItem[]> {
    return this.inventoryModel
      .find({
        tenantId,
        isActive: true,
        $expr: { $lte: ['$currentStock', '$minimumStock'] },
      })
      .sort({ name: 1 })
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<InventoryItem> {
    const item = await this.inventoryModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateInventoryItemDto,
  ): Promise<InventoryItem> {
    // Check if SKU is being updated and already exists
    if (updateDto.sku) {
      const existing = await this.inventoryModel
        .findOne({
          tenantId,
          sku: updateDto.sku,
          _id: { $ne: id },
        })
        .exec();
      if (existing) {
        throw new ConflictException(`SKU ${updateDto.sku} already exists`);
      }
    }

    const item = await this.inventoryModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }

  async restock(
    tenantId: string,
    id: string,
    quantity: number,
  ): Promise<InventoryItem> {
    const item = await this.inventoryModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    item.currentStock += quantity;
    item.lastRestocked = new Date();
    return item.save();
  }

  async deductStock(
    tenantId: string,
    id: string,
    quantity: number,
  ): Promise<InventoryItem> {
    const item = await this.inventoryModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (item.currentStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.currentStock}, Requested: ${quantity}`,
      );
    }

    item.currentStock -= quantity;
    return item.save();
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.inventoryModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();
    if (!result) {
      throw new NotFoundException('Inventory item not found');
    }
  }
}
