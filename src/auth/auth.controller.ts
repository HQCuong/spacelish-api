import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Cookies } from '../common/decorators/cookies.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, refreshToken);
    return result;
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...result } = await this.authService.login(
      req.user as User,
      req.headers['user-agent'],
      req.ip,
    );
    this.setRefreshTokenCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken: newRefreshToken, ...result } =
      await this.authService.refreshTokens(
        refreshToken,
        req.headers['user-agent'],
        req.ip,
      );
    this.setRefreshTokenCookie(res, newRefreshToken);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken', { path: '/auth' });
    return result;
  }

  @Get('profile')
  getProfile(@CurrentUser() user: Omit<User, 'passwordHash'>) {
    return user;
  }

  // Set refresh token as HTTP-only cookie
  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const expirationDays =
      this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') ?? 7;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: expirationDays * 24 * 60 * 60 * 1000,
      path: '/auth',
    });
  }
}
