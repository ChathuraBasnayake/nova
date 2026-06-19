import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TransferDto {
  @ApiProperty({ example: '1000003423' })
  @IsString()
  @IsNotEmpty()
  fromAccount: string

  @ApiProperty({ example: '2000006754' })
  @IsString()
  @IsNotEmpty()
  toAccount: string

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiPropertyOptional({ example: 'Lunch money' })
  @IsString()
  @IsOptional()
  description?: string
}
