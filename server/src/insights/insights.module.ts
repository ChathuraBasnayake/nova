import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from '../accounts/entities/account.entity'
import { Transaction } from '../transactions/entities/transaction.entity'
import { Budget } from '../budgets/entities/budget.entity'
import { InsightsService } from './insights.service'
import { InsightsController } from './insights.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, Budget]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
