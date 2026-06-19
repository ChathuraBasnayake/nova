import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateBudgetDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  @IsNotEmpty()
  category: string

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  monthlyLimit: number
}
