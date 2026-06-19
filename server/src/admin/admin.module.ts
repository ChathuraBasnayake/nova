import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { User } from '../users/entities/user.entity'
import { Account } from '../accounts/entities/account.entity'
import { AuditLog } from './entities/audit-log.entity'
import { Transaction } from '../transactions/entities/transaction.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, AuditLog, Transaction])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
