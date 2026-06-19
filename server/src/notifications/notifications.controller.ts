import { Controller, Get, Sse, Param, Patch, UseGuards, ParseIntPipe, MessageEvent } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async getNotifications(@CurrentUser('userId') userId: number) {
    const data = await this.notificationsService.findAll(userId)
    return { ok: true, data }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.notificationsService.markAsRead(userId, id)
    return { ok: true, message: 'Notification marked as read.', data }
  }

  @Sse('stream')
  @ApiOperation({ summary: 'SSE stream for receiving real-time notifications' })
  streamNotifications(@CurrentUser('userId') userId: number): Observable<MessageEvent> {
    return this.notificationsService.sseStream.pipe(
      filter(event => event.userId === userId),
      map(event => ({
        data: JSON.stringify(event.notification),
      } as MessageEvent)),
    )
  }
}
