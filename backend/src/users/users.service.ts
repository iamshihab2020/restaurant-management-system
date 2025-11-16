import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(tenantId: string, createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      tenantId,
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      tenantId,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.userModel
      .find({ tenantId })
      .select('-password -refreshTokens')
      .exec();
  }

  async findOne(tenantId: string, id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, tenantId })
      .select('-password -refreshTokens')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    tenantId: string,
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, tenantId }, updateUserDto, { new: true })
      .select('-password -refreshTokens')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.userModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateRefreshTokens(userId: string, refreshTokens: string[]): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokens }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLogin: new Date()
    }).exec();
  }
}
