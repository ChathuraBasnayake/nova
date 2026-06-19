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

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([User, Account, Transaction, Budget, Notification, Payee, ScheduledTransfer]),
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
  ],
  providers: [SeedService],
})
export class AppModule {}
