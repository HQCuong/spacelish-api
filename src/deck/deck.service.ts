import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DeckService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDeckDto: CreateDeckDto) {
    const existingName = await this.prisma.deck.findFirst({
      where: {
        name: createDeckDto.name,
        userId,
      },
    });
    if (existingName) {
      throw new ConflictException('You already have a deck with this name');
    }

    const deck = await this.prisma.deck.create({
      data: {
        name: createDeckDto.name,
        description: createDeckDto.description,
        languageFrom: createDeckDto.languageFrom,
        languageTo: createDeckDto.languageTo,
        isPublic: createDeckDto.isPublic ?? false,
        userId,
      },
    });

    return deck;
  }

  async findAccessible(userId: number) {
    return this.prisma.deck.findMany({
      where: {
        OR: [{ userId }, { isPublic: true }],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMine(userId: number) {
    return this.prisma.deck.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const deck = await this.prisma.deck.findUnique({ where: { id } });
    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
    if (deck.userId !== userId && !deck.isPublic) {
      throw new ForbiddenException(
        'You are not authorized to access this deck',
      );
    }
    return deck;
  }

  async update(userId: number, id: number, updateDeckDto: UpdateDeckDto) {
    const deck = await this.prisma.deck.findUnique({ where: { id } });
    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
    if (deck.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this deck',
      );
    }

    if (updateDeckDto.name !== undefined) {
      const existingName = await this.prisma.deck.findFirst({
        where: {
          name: updateDeckDto.name,
          userId,
          NOT: { id },
        },
      });
      if (existingName) {
        throw new ConflictException('You already have a deck with this name');
      }
    }

    return this.prisma.deck.update({
      where: { id },
      data: {
        name: updateDeckDto.name,
        description: updateDeckDto.description,
        languageFrom: updateDeckDto.languageFrom,
        languageTo: updateDeckDto.languageTo,
        isPublic: updateDeckDto.isPublic,
      },
    });
  }

  async remove(userId: number, id: number) {
    const deck = await this.prisma.deck.findUnique({ where: { id } });
    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
    if (deck.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this deck',
      );
    }
    await this.prisma.deck.delete({ where: { id } });
    return { message: 'Deck deleted successfully' };
  }
}
