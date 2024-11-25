import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, GetUsersDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '@src/jwt/guard/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Post()
  async createUser(@Res() response, @Body() createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.findByEmail(createUserDto.emailId);

      if (existingUser) {
        // If email exists, return an error response
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already exists!',
          error: 'Bad Request',
        });
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;

      const newUser = await this.userService.createUser(createUserDto);
      return response.status(HttpStatus.CREATED).json({
        message: 'User has been created successfully',
        newUser,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error: User not created!',
        error: 'Bad Request',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateUser(
    @Res() response,
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {

      if (updateUserDto.emailId) {
        const existingUserByEmail = await this.userService.findByEmail(updateUserDto.emailId);

        if (existingUserByEmail && existingUserByEmail._id.toString() !== userId) {
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Email already exists!',
            error: 'Bad Request',
          });
        }
      }


      const existingUser = await this.userService.updateUser(userId, updateUserDto);
      return response.status(HttpStatus.OK).json({
        message: 'User has been successfully updated',
        existingUser,
      });
    } catch (err) {
      return response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating user',
        error: err.response || 'Internal Server Error',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    try {
      const result = await this.userService.getAllUsers(query);
      return result;
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getUser(@Res() response, @Param('id') userId: string) {
    try {
      const existingUser = await this.userService.getUser(userId);
      return response.status(HttpStatus.OK).json({
        message: 'User found successfully',
        existingUser,
      });
    } catch (err) {
      return response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error fetching user',
        error: err.response || 'Internal Server Error',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteUser(@Res() response, @Param('id') userId: string) {
    try {
      const deletedUser = await this.userService.deleteUser(userId);
      return response.status(HttpStatus.OK).json({
        message: 'User deleted successfully',
        deletedUser,
      });
    } catch (err) {
      return response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting user',
        error: err.response || 'Internal Server Error',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('active/:id')
  async activeUser(@Res() response, @Param('id') userId: string) {
    try {
      const existingUser = await this.userService.updateUser(userId, {
        isActive: true,
      });
      return response.status(HttpStatus.OK).json({
        message: 'User has been successfully activated',
        existingUser,
      });
    } catch (err) {
      return response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error activating user',
        error: err.response || 'Internal Server Error',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('inactive/:id')
  async inActiveUser(@Res() response, @Param('id') userId: string) {
    try {
      const existingUser = await this.userService.updateUser(userId, {
        isActive: false,
      });
      return response.status(HttpStatus.OK).json({
        message: 'User has been successfully inactivated',
        existingUser,
      });
    } catch (err) {
      return response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error inactivating user',
        error: err.response || 'Internal Server Error',
      });
    }
  }
}
