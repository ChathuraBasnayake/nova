import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from '../accounts/entities/account.entity'
import { Transaction } from '../transactions/entities/transaction.entity'
import { StatementsService } from './statements.service'
import { StatementsController } from './statements.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction]),
  ],
  controllers: [StatementsController],
  providers: [StatementsService],
  exports: [StatementsService],
})
export class StatementsModule {}
