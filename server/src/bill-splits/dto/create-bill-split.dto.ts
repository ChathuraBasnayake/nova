import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBillSplitDto {
  @ApiProperty({ description: 'Username of the user who will pay the split' })
  @IsString()
  @IsNotEmpty()
  payerUsername: string

  @ApiProperty({ description: 'Amount to be paid by the payer' })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({ description: 'Description or reason for splitting' })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiPropertyOptional({ description: 'Optional transaction ID being split' })
  @IsOptional()
  @IsNumber()
  transactionId?: number
}
