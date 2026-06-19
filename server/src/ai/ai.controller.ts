import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AiService } from './ai.service'

import { IsNotEmpty, IsString } from 'class-validator'

class ChatDto {
  @IsNotEmpty()
  @IsString()
  message: string
}

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send message to Nova AI financial advisor' })
  async chat(
    @CurrentUser('userId') userId: number,
    @Body() dto: ChatDto,
  ) {
    const response = await this.aiService.getChatResponse(userId, dto.message)
    return { ok: true, response }
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get current AI spending insight one-liner' })
  async getInsights(@CurrentUser('userId') userId: number) {
    const summary = await this.aiService.getSpendingSummaryInsight(userId)
    return { ok: true, summary }
  }
}
