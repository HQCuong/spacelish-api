import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  languageFrom!: string;

  @IsString()
  @IsNotEmpty()
  languageTo!: string;

  @IsBoolean()
  isPublic?: boolean;
}
