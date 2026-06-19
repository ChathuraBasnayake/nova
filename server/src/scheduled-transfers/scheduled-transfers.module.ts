import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduledTransfer } from './entities/scheduled-transfer.entity'
import { ScheduledTransfersService } from './scheduled-transfers.service'
import { ScheduledTransfersController } from './scheduled-transfers.controller'
import { Account } from '../accounts/entities/account.entity'
import { TransferModule } from '../transfer/transfer.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledTransfer, Account]),
    TransferModule,
    NotificationsModule,
  ],
  controllers: [ScheduledTransfersController],
  providers: [ScheduledTransfersService],
  exports: [ScheduledTransfersService],
})
export class ScheduledTransfersModule {}
