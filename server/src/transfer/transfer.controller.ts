import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { TransferService } from './transfer.service'
import { TransferDto } from './dto/transfer.dto'

@ApiTags('Transfer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @ApiOperation({ summary: 'Execute a bank transfer between accounts' })
  executeTransfer(
    @Body() transferDto: TransferDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.transferService.execute(transferDto, userId)
  }
}
