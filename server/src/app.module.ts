import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from './config/database.config'
import { SeedService } from './config/seed.service'

// Import entities for Seeding
import { User } from './users/entities/user.entity'
import { Account } from './accounts/entities/account.entity'
import { Transaction } from './transactions/entities/transaction.entity'
import { Budget } from './budgets/entities/budget.entity'
import { Notification } from './notifications/entities/notification.entity'
import { Payee } from './payees/entities/payee.entity'
import { ScheduledTransfer } from './scheduled-transfers/entities/scheduled-transfer.entity'
import { VirtualCard } from './virtual-cards/entities/virtual-card.entity'
import { BillSplit } from './bill-splits/entities/bill-split.entity'

// Import modules
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AccountsModule } from './accounts/accounts.module'
import { TransactionsModule } from './transactions/transactions.module'
import { TransferModule } from './transfer/transfer.module'
import { SearchModule } from './search/search.module'
import { AdminModule } from './admin/admin.module'
import { HealthModule } from './health/health.module'
import { BudgetsModule } from './budgets/budgets.module'
import { InsightsModule } from './insights/insights.module'
import { AiModule } from './ai/ai.module'
import { NotificationsModule } from './notifications/notifications.module'
import { PayeesModule } from './payees/payees.module'
import { StatementsModule } from './statements/statements.module'
import { ScheduledTransfersModule } from './scheduled-transfers/scheduled-transfers.module'
import { MailModule } from './mail/mail.module'
import { VirtualCardsModule } from './virtual-cards/virtual-cards.module'
import { BillSplitsModule } from './bill-splits/bill-splits.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([
      User,
      Account,
      Transaction,
      Budget,
      Notification,
      Payee,
      ScheduledTransfer,
      VirtualCard,
      BillSplit,
    ]),
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    TransferModule,
    SearchModule,
    AdminModule,
    HealthModule,
    BudgetsModule,
    InsightsModule,
    AiModule,
    NotificationsModule,
    PayeesModule,
    StatementsModule,
    ScheduledTransfersModule,
    MailModule,
    VirtualCardsModule,
    BillSplitsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
