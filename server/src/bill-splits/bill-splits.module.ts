import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BillSplit } from './entities/bill-split.entity'
import { User } from '../users/entities/user.entity'
import { Account } from '../accounts/entities/account.entity'
import { BillSplitsService } from './bill-splits.service'
import { BillSplitsController } from './bill-splits.controller'
import { NotificationsModule } from '../notifications/notifications.module'
import { TransferModule } from '../transfer/transfer.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([BillSplit, User, Account]),
    NotificationsModule,
    TransferModule,
  ],
  controllers: [BillSplitsController],
  providers: [BillSplitsService],
  exports: [BillSplitsService],
})
export class BillSplitsModule {}
