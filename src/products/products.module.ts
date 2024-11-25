import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { ProductSchema } from './../schema/product.schema';
import { JwtAuthModule } from '@src/jwt/jwt.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]), JwtAuthModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }
