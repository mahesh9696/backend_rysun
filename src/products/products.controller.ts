import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Res, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './products.service';
import { CreateProductDto, GetProductsDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { join } from 'path';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@src/jwt/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@Req() req: Request, @Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    try {
      const imageUrl = await this.productService.uploadImage(file);
      createProductDto.userId = req.user.id;
      return this.productService.create(createProductDto, imageUrl);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: GetProductsDto) {
    try {
      const { id: userId, role } = req.user;
      return this.productService.findAll({ ...query, userId, role });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    try {
      const { id: userId, role } = req.user;
      return this.productService.findOne(id, userId, role);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFile() file?: Express.Multer.File) {
    try {
      const imageUrl = file ? await this.productService.uploadImage(file) : undefined;
      return this.productService.update(id, updateProductDto, imageUrl);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return this.productService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('uploads/:fileName')
  async getUploadedFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const filePath = join(__dirname, '..', '..', 'uploads', fileName);
      res.sendFile(filePath);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
