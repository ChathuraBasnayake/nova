import { IsString, IsNotEmpty, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateNicknameDto {
  @ApiProperty({ example: 'My New Nickname' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  nickname: string
}
