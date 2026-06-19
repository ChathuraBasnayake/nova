import { IsString, MinLength, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'dilara' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1)
  password: string
}
