import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { User } from '../users/entities/user.entity'
import { Account } from '../accounts/entities/account.entity'
import { AuditLog } from './entities/audit-log.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, AuditLog])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
