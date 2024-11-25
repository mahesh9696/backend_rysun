import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/interface/user.interface';
import { Model, Types } from "mongoose";
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from './../schema/user.schema';
interface FindAllQuery {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  userId?: Types.ObjectId;
  role?: string;
}
@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await new this.userModel(createUserDto);
    return newUser.save();
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    if (!existingUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return existingUser;
  }

  async getAllUsers(query: FindAllQuery): Promise<User[] | any> {

    const { keyword, startDate, endDate, page = 1, limit = 10, userId, role } = query;
    const skip = (page - 1) * limit;

    let filter: any = {};
    if (role === 'user' && userId) {
      filter.userId = userId;
    }
    if (keyword) {
      filter.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { emailId: { $regex: keyword, $options: 'i' } },

      ];
    }
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    const users = await this.userModel.find(filter).skip(skip).limit(limit).exec();
    const total = await this.userModel.countDocuments(filter).exec();
    return {
      total,
      page,
      limit,
      users,
    };
  }

  async getUser(userId: string): Promise<User> {
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return existingUser;
  }

  async deleteUser(userId: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return deletedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ emailId: email }).exec(); // Returns a user if found, otherwise null
  }
}