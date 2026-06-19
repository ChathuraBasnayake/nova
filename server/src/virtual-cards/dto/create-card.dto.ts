import { IsNumber, IsIn, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCardDto {
  @ApiProperty()
  @IsNumber()
  accountId: number

  @ApiProperty({ enum: ['debit', 'credit'] })
  @IsIn(['debit', 'credit'])
  cardType: 'debit' | 'credit'

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  dailyLimit?: number
}
