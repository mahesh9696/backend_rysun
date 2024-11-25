import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // Login route: generates JWT token
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // Protected route: only accessible with a valid JWT
  @UseGuards(JwtGuard)
  @Post('protected')
  async protected() {
    return { message: 'You have access to this protected route' };
  }
}
