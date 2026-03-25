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

  // ======== 1. REGISTER ========
  async register(dto: RegisterDto) {
    // Check duplicate email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check duplicate name
    const existingName = await this.prisma.user.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException('Name already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        authProvider: 'LOCAL',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ======== 2. VALIDATE USER (used by LocalStrategy) ========
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // User not found or no password (OAuth user)
    if (!user || !user.passwordHash) {
      return null;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  // ======== 3. LOGIN ========
  async login(user: User, deviceInfo?: string, ipAddress?: string) {
    // Update lastLoginAt
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

  // ======== 4. GENERATE TOKENS ========
  async generateTokens(
    userId: number,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    // Access token - short-lived
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRATION') },
    );

    // Refresh token - long-lived, with jti for identification
    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh', jti },
      { expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION') },
    );

    // Hash refresh token with SHA-256 and store in DB
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

  // ======== 5. REFRESH TOKENS ========
  async refreshTokens(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    // Verify JWT
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Hash incoming token and compare with DB
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

    // Revoke old token
    await this.prisma.userToken.update({
      where: { id: storedToken.id },
      data: {
        isRevoked: true,
        lastUsedAt: new Date(),
      },
    });

    // Generate new token pair (rotation)
    return this.generateTokens(payload.sub, deviceInfo, ipAddress);
  }

  // ======== 6. LOGOUT ========
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

  // ======== HELPER: Strip passwordHash from user object ========
  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = user;

    return sanitized;
  }
}
