import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from '../accounts/entities/account.entity'
import { Transaction } from '../transactions/entities/transaction.entity'
import { Budget } from '../budgets/entities/budget.entity'
import { AiService } from './ai.service'
import { AiController } from './ai.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, Budget]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
