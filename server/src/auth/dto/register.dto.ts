import { IsString, MinLength, IsNotEmpty, IsEmail, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'newuser' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string

  @ApiPropertyOptional({ example: '200112345678' })
  @IsString()
  @IsOptional()
  nic?: string

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string
}
