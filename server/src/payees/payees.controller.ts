import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { PayeesService } from './payees.service'
import { CreatePayeeDto } from './dto/create-payee.dto'

@ApiTags('Payees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payees')
export class PayeesController {
  constructor(private readonly payeesService: PayeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved transfer payees for current user' })
  async getPayees(@CurrentUser('userId') userId: number) {
    const data = await this.payeesService.findAll(userId)
    return { ok: true, data }
  }

  @Post()
  @ApiOperation({ summary: 'Save a new payee for future transfers' })
  async savePayee(
    @CurrentUser('userId') userId: number,
    @Body() dto: CreatePayeeDto,
  ) {
    const data = await this.payeesService.create(userId, dto)
    return { ok: true, message: 'Payee saved successfully.', data }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a saved payee' })
  async removePayee(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.payeesService.remove(userId, id)
    return { ok: true, message: 'Payee removed successfully.' }
  }
}
