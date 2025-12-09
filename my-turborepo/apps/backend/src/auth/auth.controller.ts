import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Full DTO:', JSON.stringify(loginDto));
    console.log('Email:', loginDto.email);
    console.log('Password exists:', !!loginDto.password);
    console.log('Password length:', loginDto.password?.length);
    
    try {
      const result = await this.authService.login(loginDto);
      console.log('Login successful for:', loginDto.email);
      return result;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }
}
