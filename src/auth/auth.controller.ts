import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request) {
    return this.authService.login(
      req.user as User,
      req.headers['user-agent'],
      req.ip,
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
  ) {
    return this.authService.refreshTokens(
      refreshToken,
      req.headers['user-agent'],
      req.ip,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: Omit<User, 'passwordHash'>) {
    return user;
  }
}
