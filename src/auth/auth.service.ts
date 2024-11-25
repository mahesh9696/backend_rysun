import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './../schema/user.schema';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }


  async login(email: string, password: string) {

    const user = await this.userModel.findOne({
      emailId: email,
      isActive: true
    });



    if (!user) throw new UnauthorizedException('invalid email or password');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException('invalid email or password');

    const token = await this.jwtService.sign(
      { id: user.id, fullName: user.fullName, role: user.userType },
      {
        secret: this.configService.get('JWT_SECRET') || 'ac2323',
      },
    );
    return { token };
  }
}