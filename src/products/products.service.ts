import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './../schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

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
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) { }

  private static uploadDir = path.join(__dirname, '..', '..', 'uploads');

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileName = uuidv4() + path.extname(file.originalname);
    const filePath = path.join(ProductService.uploadDir, fileName);

    if (!fs.existsSync(ProductService.uploadDir)) {
      fs.mkdirSync(ProductService.uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${fileName}`;
  }

  async create(createProductDto: CreateProductDto, imageUrl: string): Promise<Product> {
    const newProduct = new this.productModel({
      ...createProductDto,
      imageUrl,
    });
    return newProduct.save();
  }

  async findAll(query: FindAllQuery) {
    const { keyword, startDate, endDate, page = 1, limit = 10, userId, role } = query;
    const skip = (page - 1) * limit;

    let filter: any = {};
    if (role === 'user' && userId) {
      filter.userId = userId;
    }
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    const products = await this.productModel.find(filter).skip(skip).limit(limit).populate('userId', 'fullName').exec();
    const total = await this.productModel.countDocuments(filter).exec();

    return {
      total,
      page,
      limit,
      products,
    };
  }


  async findOne(id: string, userId: string, role: string): Promise<Product> {
    const query: any = { _id: id }; // Start with the product ID in the query
    if (role === 'user') {
      query.userId = userId; // Add the userId to the query if the role is 'user'
    }
    const product = await this.productModel.findOne(query).populate('userId', 'fullName').exec();;

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, imageUrl?: string): Promise<Product> {
    if (imageUrl) {
      updateProductDto.imageUrl = imageUrl;
    }
    const existingProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true });
    if (!existingProduct) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return existingProduct;
  }

  async remove(id: string): Promise<any> {

    const deletedProduct = await this.productModel.findByIdAndUpdate(id, { deletedAt: new Date() });
    if (!deletedProduct) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return deletedProduct;

  }
}
