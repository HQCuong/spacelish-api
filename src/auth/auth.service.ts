import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';

interface JwtPayload {
  sub: number;
  type: 'access' | 'refresh';
  jti?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingName = await this.prisma.user.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException('Name already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        authProvider: 'LOCAL',
      },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  async login(user: User, deviceInfo?: string, ipAddress?: string) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, deviceInfo, ipAddress);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async generateTokens(
    userId: number,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRATION') },
    );

    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh', jti },
      { expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION') },
    );

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const expirationDays =
      this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') ?? 7;

    await this.prisma.userToken.create({
      data: {
        userId,
        tokenType: 'REFRESH',
        tokenHash,
        deviceInfo,
        ipAddress,
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await this.prisma.userToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        tokenType: 'REFRESH',
        isRevoked: false,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    await this.prisma.userToken.update({
      where: { id: storedToken.id },
      data: {
        isRevoked: true,
        lastUsedAt: new Date(),
      },
    });

    return this.generateTokens(payload.sub, deviceInfo, ipAddress);
  }

  async logout(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.userToken.updateMany({
      where: {
        userId: payload.sub,
        tokenHash,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = user;

    return sanitized;
  }
}
