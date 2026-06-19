import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SavingsJar } from './entities/savings-jar.entity'
import { Account } from '../accounts/entities/account.entity'
import { SavingsJarsService } from './savings-jars.service'
import { SavingsJarsController } from './savings-jars.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([SavingsJar, Account]),
    NotificationsModule,
  ],
  controllers: [SavingsJarsController],
  providers: [SavingsJarsService],
  exports: [SavingsJarsService],
})
export class SavingsJarsModule {}
