import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(
    tenantId: string,
    createDto: CreateCustomerDto,
  ): Promise<Customer> {
    const existing = await this.customerModel.findOne({
      tenantId,
      phone: createDto.phone,
    });
    if (existing) {
      throw new ConflictException(
        'Customer with this phone number already exists',
      );
    }

    const customer = new this.customerModel({
      ...createDto,
      tenantId,
    });
    return customer.save();
  }

  async findAll(tenantId: string): Promise<Customer[]> {
    return this.customerModel
      .find({ tenantId, isActive: true })
      .sort({ lastVisit: -1 })
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<Customer> {
    const customer = await this.customerModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async findByPhone(
    tenantId: string,
    phone: string,
  ): Promise<Customer | null> {
    return this.customerModel.findOne({ tenantId, phone }).exec();
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async updateStats(id: string, orderAmount: number): Promise<void> {
    await this.customerModel
      .findByIdAndUpdate(id, {
        $inc: { totalOrders: 1, totalSpent: orderAmount },
        lastVisit: new Date(),
      })
      .exec();
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.customerModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();
    if (!result) {
      throw new NotFoundException('Customer not found');
    }
  }
}
